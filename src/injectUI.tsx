import { deepCloneJSON, isNode, sort } from "socket-function/src/misc";
import { DiskCollection } from "./storage/DiskCollection";
import { observer } from "./misc/observer";
import preact from "preact";
import { css } from "typesafecss";
import { observable } from "./misc/mobxTyped";
import { formatDate, formatDateTime } from "socket-function/src/formatting/format";


const nonSupplyCards = [
    "Curse", "Estate", "Duchy", "Province", "Copper", "Silver", "Gold",
    "Horse",
    // https://wiki.dominionstrategy.com/index.php/Category:Non-Supply_cards
    "Amphora", "Bag of Gold", "Bat", "Coronet", "Courser", "Cursed Gold", "Demesne", "Diadem", "Doubloons", "Endless Chalice", "Figurehead", "Followers", "Ghost", "Goat", "Hammer", "Haunted Mirror", "Horse", "Housecarl", "Hovel", "Huge Turnip", "Imp", "Insignia", "Jewels", "Lucky Coin", "Madman", "Magic Lamp", "Mercenary", "Necropolis", "Orb", "Overgrown Estate", "Pasture", "Pouch", "Princess", "Prize Goat", "Puzzle Box", "Renown", "Sextant", "Shield", "Spell Scroll", "Spoils", "Staff", "Sword", "Trusty Steed", "Will-o'-Wisp", "Wish", "Zombie Apprentice", "Zombie Mason", "Zombie Spy",
];

type GameInfo = {
    id: string;
    time: number;
    replayList: string[];
};

const DOM_POLL_INTERVAL = 500;

let games = new DiskCollection<GameInfo>("games");

@observer
class InboxReplacement extends preact.Component {
    synced = observable({
        lastDeleted: undefined as GameInfo | undefined,
    }, undefined, { deep: false });
    render() {
        let gamesList = games.getValues().slice();
        if (this.synced.lastDeleted) {
            gamesList.push(this.synced.lastDeleted);
        }
        sort(gamesList, x => -x.time);
        return (
            <div
                id="InboxReplacement"
                className={
                    css
                        .absolute.pos(0, 0).fillBoth
                        .borderRadius(11)
                        .hsla(30, 10, 50, 1)
                        .zIndex(1)
                        .pad2(20)
                        .vbox(10)
                }
            >
                <div className={css.hbox(20).wrap.alignItems("start").marginRight(100)
                    .overflowAuto
                    .pad2(10)
                }>
                    {gamesList.map(game => (
                        <div className={
                            css.vbox(8).maxWidth("calc(30% - 10px)")
                                .pad2(10, 4).boxShadow("0 0 10px black")
                            + (this.synced.lastDeleted === game && css.opacity(0.5))
                        }>
                            <div className={css.hbox(10)}>
                                <h3 title={game.id}>{formatDateTime(game.time)}</h3>
                                <div className={css.marginAuto} />
                                <div className={css.hbox(5, 2)}>
                                    <button onClick={() => createTable(game.replayList)}>
                                        Create
                                    </button>
                                    <button onClick={() => navigator.clipboard.writeText(game.replayList.join(", "))}>
                                        Copy
                                    </button>
                                    <button onClick={() => {
                                        if (this.synced.lastDeleted === game) {
                                            this.synced.lastDeleted = undefined;
                                            games.set(game.id, deepCloneJSON(game));
                                        } else {
                                            this.synced.lastDeleted = deepCloneJSON(game);
                                            games.remove(game.id);
                                        }
                                    }}>
                                        {this.synced.lastDeleted === game ? "Undelete" : "Delete"}
                                    </button>
                                </div>
                            </div>
                            <div className={css.marginLeft(25).hbox(10).wrap}>
                                {game.replayList.map(card => (
                                    <div className={css.hsla(216, 50, 50, 0.5).pad2(6, 2)}>
                                        {card}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}

export async function injectUI() {
    console.log("Injecting UI");
    setInterval(async () => {
        let gameNumber = getGameNumber();
        if (!gameNumber) return;
        if (await games.getPromise(gameNumber)) return;
        let replayList = getReplayList();
        console.warn("EXTENSION: Found new game", gameNumber, replayList);
        games.set(gameNumber, {
            id: gameNumber,
            replayList,
            time: Date.now(),
        });
    }, DOM_POLL_INTERVAL);

    setInterval(() => {
        if (getCurrentTab() === "Inbox") {
            let page = document.querySelector(".window.inbox");
            if (!page) return;
            if (page.querySelector("#InboxReplacement")) return;
            preact.render(null, page);
            preact.render(<InboxReplacement />, page);
        } else {
            document.querySelector("#InboxReplacement")?.remove();
        }
    }, DOM_POLL_INTERVAL);
}

function getCurrentTab() {
    return document.querySelector(".tab.selected")?.textContent?.trim();
}

(globalThis as any).getReplayList = getReplayList;
function getReplayList(): string[] {
    function getStackName(stack: Element) {
        return stack.querySelector(".name-layer")?.textContent || "";
    }

    let stacks = Array.from(document.querySelectorAll(".card-stacks > div"));
    let allNames = new Set(stacks.map(x => getStackName(x)).filter(x => x));

    let mainNames = new Set(stacks.map(x => getStackName(x)).filter(x => x));

    for (let defaultName of nonSupplyCards) {
        mainNames.delete(defaultName);
    }

    if (allNames.has("Overgrown Estate") || allNames.has("Hovel") || allNames.has("Necropolis")) {
        mainNames.add("Shelters");
    } else {
        mainNames.add("No Shelters");
    }
    if (allNames.has("Platinum") || allNames.has("Colony")) {
        mainNames.add("Colonies");
    } else {
        mainNames.add("No Colonies");
    }

    for (let stack of stacks) {
        let nextStack = stack?.nextElementSibling;
        if (!nextStack) continue;
        let height = stack.getBoundingClientRect().height;
        if (nextStack.getBoundingClientRect().height >= height * 0.5) continue;
        if (nextStack.getBoundingClientRect().height <= 0) continue;
        // Find really short stacks, which are associated cardsa
        let baseName = getStackName(stack);
        if (!mainNames.has(baseName)) continue;
        let addOnName = getStackName(nextStack);
        mainNames.delete(addOnName);
        mainNames.add(`${addOnName} (${baseName})`);
    }

    return Array.from(mainNames);
}

function getGameNumber() {
    // first .log-line in .game-log
    let rawText = document.querySelector(".game-log .log-line")?.textContent;
    if (!rawText) return undefined;
    return rawText.split(",")[0].replace("Game #", "").trim();
}

function getElementWithText(text: string) {
    return document.evaluate(`//*[contains(text(),'${text}')]`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLElement | undefined;
}
async function getElementWait(get: () => HTMLElement | undefined | null, timeout = 10000) {
    let start = Date.now();
    while (true) {
        let element = get();
        if (element) return element;
        if (Date.now() - start > timeout) {
            throw new Error(`EXTENSION: Timed out waiting for element`);
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}
async function getElementWithTextWait(text: string, timeout = 10000) {
    return getElementWait(() => getElementWithText(text), timeout);
}
async function getElementWithTexstWait(text: string[], timeout = 10000) {
    return getElementWait(() => text.map(getElementWithText).reduce((a, b) => a || b), timeout);
}
async function getElementWithClassWait(selector: string, timeout = 10000) {
    return getElementWait(() => document.querySelector(selector) as any, timeout);
}

async function createTable(cards: string[]) {
    (await getElementWithTexstWait(["My Table", "New Table"])).click();
    (await getElementWithTextWait("Select Kingdom Cards")).click();
    // card-selector-input ng-pristine ng-valid ng-empty ng-touched
    let element = (await getElementWithClassWait(".card-selector-input")) as HTMLInputElement;
    // Change with an event
    element.focus();
    element.value = cards.join(", ");
    element.dispatchEvent(new Event("input", { bubbles: true }));
    // Simulate enter press
    element.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", keyCode: 13, which: 13, bubbles: true, cancelable: true }));
    element.dispatchEvent(new KeyboardEvent("keypress", { key: "Enter", code: "Enter", keyCode: 13, which: 13, bubbles: true, cancelable: true }));
    element.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", code: "Enter", keyCode: 13, which: 13, bubbles: true, cancelable: true }));
}

if (!isNode()) {
    (window as any).getReplayList = getReplayList;
}
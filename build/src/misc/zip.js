
    let exports = {};
    let module = { exports };
    "use strict";

//exports.Zip = void 0;
class Zip {
    static async gzip(buffer, level) {
        return await doStream(new CompressionStream("gzip"), buffer);
    }
    static async gunzip(buffer) {
        return await doStream(new DecompressionStream("gzip"), buffer);
    }
    static async gunzipBatch(buffers) {
        let time = Date.now();
        buffers = await Promise.all(buffers.map(Zip.gunzip));
        time = Date.now() - time;
        //let totalSize = buffers.reduce((acc, buffer) => acc + buffer.length, 0);
        //console.log(`Gunzip ${formatNumber(totalSize)}B at ${formatNumber(totalSize / time * 1000)}B/s`);
        return buffers;
    }
}
exports.Zip = Zip;
async function doStream(stream, buffer) {
    let reader = stream.readable.getReader();
    let writer = stream.writable.getWriter();
    let writePromise = writer.write(buffer);
    let closePromise = writer.close();
    let outputBuffers = [];
    while (true) {
        let { value, done } = await reader.read();
        if (done) {
            await writePromise;
            await closePromise;
            return Buffer.concat(outputBuffers);
        }
        outputBuffers.push(Buffer.from(value));
    }
}

 /* _JS_SOURCE_HASH = "cd856d3d99764cb0caf323f75f8f05ba6c0b7d8006215d27b5592b37e3294659"; */
    ;
    export default exports;
    
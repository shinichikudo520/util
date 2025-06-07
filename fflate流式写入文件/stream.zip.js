var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var ChunkedZipValidator = /** @class */ (function () {
    function ChunkedZipValidator() {
    }
    ChunkedZipValidator.validate = function (chunks) {
        // 验证本地文件头
        this.scanChunks(chunks, 0, this.LOCAL_HEADER, "Missing local file header");
        // 查找中央目录记录
        var centralPos = this.findSignatureAcrossChunks(chunks, this.CENTRAL_DIR);
        if (centralPos.chunkIndex === -1) {
            throw new Error("Central directory signature not found");
        }
    };
    ChunkedZipValidator.scanChunks = function (chunks, globalOffset, signature, errorMsg) {
        var remaining = signature.length;
        var sigIndex = 0;
        for (var _i = 0, chunks_1 = chunks; _i < chunks_1.length; _i++) {
            var chunk = chunks_1[_i];
            for (var i = 0; i < chunk.length && sigIndex < signature.length; i++) {
                if (chunk[i] !== signature[sigIndex]) {
                    throw new Error("".concat(errorMsg, " at position ").concat(globalOffset + i));
                }
                sigIndex++;
                remaining--;
            }
            globalOffset += chunk.length;
            if (remaining <= 0)
                break;
        }
    };
    ChunkedZipValidator.findSignatureAcrossChunks = function (chunks, signature) {
        var globalOffset = 0;
        for (var chunkIdx = 0; chunkIdx < chunks.length; chunkIdx++) {
            var chunk = chunks[chunkIdx];
            for (var i = 0; i <= chunk.length - signature.length; i++) {
                var match = true;
                for (var j = 0; j < signature.length; j++) {
                    if (i + j >= chunk.length) {
                        // 跨块匹配处理
                        if (chunkIdx + 1 >= chunks.length) {
                            match = false;
                            break;
                        }
                        if (chunks[chunkIdx + 1][i + j - chunk.length] !== signature[j]) {
                            match = false;
                            break;
                        }
                    }
                    else if (chunk[i + j] !== signature[j]) {
                        match = false;
                        break;
                    }
                }
                if (match) {
                    return {
                        chunkIndex: chunkIdx,
                        position: i,
                    };
                }
            }
            globalOffset += chunk.length;
        }
        return { chunkIndex: -1, position: -1 };
    };
    ChunkedZipValidator.LOCAL_HEADER = [0x50, 0x4b, 0x03, 0x04];
    ChunkedZipValidator.CENTRAL_DIR = [0x50, 0x4b, 0x01, 0x02];
    return ChunkedZipValidator;
}());
var StreamZip = /** @class */ (function () {
    function StreamZip(level) {
        if (level === void 0) { level = 6; }
        var _this = this;
        /** file 对象 */
        this.files = {};
        /** 数据块 */
        this.chunks = [];
        this.zip = new fflate.Zip(function (err, chunk) {
            if (err)
                throw err;
            _this.chunks.push(chunk);
        });
        this.level = level;
    }
    StreamZip.prototype.addFolder = function (foldername) {
        var path = "".concat(foldername, "/");
        this.addFile(path);
    };
    StreamZip.prototype.addFile = function (filename) {
        var stream = new fflate.ZipDeflate(filename, { level: this.level });
        this.files[filename] = stream;
        this.zip.add(stream);
    };
    StreamZip.prototype.appendData = function (filename, data) {
        if (!this.files[filename])
            throw new Error("File ".concat(filename, " not exists"));
        this.files[filename].push(data);
    };
    StreamZip.prototype.finalize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 终止所有文件流
                Object.values(this.files).forEach(function (stream) {
                    stream.push(new Uint8Array(0), true);
                });
                this.zip.end();
                ChunkedZipValidator.validate(this.chunks);
                return [2 /*return*/, this.chunks];
            });
        });
    };
    StreamZip.prototype.unit8array = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, merged;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.finalize()];
                    case 1:
                        result = _a.sent();
                        merged = this.mergeChunks(result);
                        return [2 /*return*/, merged];
                }
            });
        });
    };
    /** 合并数据块 */
    StreamZip.prototype.mergeChunks = function (chunks) {
        var totalSize = chunks.reduce(function (sum, c) { return sum + c.length; }, 0);
        var result = new Uint8Array(totalSize);
        var offset = 0;
        chunks.forEach(function (chunk) {
            result.set(chunk, offset);
            offset += chunk.length;
        });
        return result;
    };
    StreamZip.prototype.blob = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.finalize()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, new Blob(result, { type: "application/zip" })];
                }
            });
        });
    };
    return StreamZip;
}());
var btn = document.getElementById("btn");
if (btn) {
    btn.addEventListener("click", function () {
        return __awaiter(this, void 0, void 0, function () {
            var zip, blob, url, a;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        zip = new StreamZip(9);
                        zip.addFolder("main");
                        zip.addFile("main/Hello world.txt");
                        zip.appendData("main/Hello world.txt", new TextEncoder().encode("Hello world"));
                        zip.addFile("main/Hello world1.txt");
                        zip.appendData("main/Hello world1.txt", new TextEncoder().encode("Hello world1"));
                        return [4 /*yield*/, zip.blob()];
                    case 1:
                        blob = _a.sent();
                        url = URL.createObjectURL(blob);
                        a = document.createElement("a");
                        a.href = url;
                        a.download = "StreamZip.zip";
                        document.body.appendChild(a);
                        a.click();
                        return [2 /*return*/];
                }
            });
        });
    });
}

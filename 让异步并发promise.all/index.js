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
var _this = this;
(function () { return __awaiter(_this, void 0, void 0, function () {
    function batchSync(datas) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        result = [];
                        return [4 /*yield*/, splitBulk(LIMIT, datas, function (arr) { return __awaiter(_this, void 0, void 0, function () {
                                var tasks, _loop_2, i, temp;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            tasks = [];
                                            _loop_2 = function (i) {
                                                var item = arr[i];
                                                var p = new Promise(function (resolve) {
                                                    resolve(item);
                                                });
                                                tasks.push(p);
                                            };
                                            for (i = 0; i < arr.length; i++) {
                                                _loop_2(i);
                                            }
                                            return [4 /*yield*/, Promise.all(tasks)];
                                        case 1:
                                            temp = _a.sent();
                                            result = result.concat(temp);
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    }
    function splitBulk(limit, datas, cb) {
        return __awaiter(this, void 0, void 0, function () {
            var len, i, maxI;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        len = datas.length;
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < len)) return [3 /*break*/, 4];
                        maxI = Math.min(len, i + limit);
                        return [4 /*yield*/, cb(datas.slice(i, maxI))];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        i += limit;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    var tasks, _loop_1, i, result, LIMIT, _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                tasks = [];
                _loop_1 = function (i) {
                    var p = new Promise(function (resolve) {
                        resolve(i);
                    });
                    tasks.push(p);
                };
                for (i = 0; i < 10; i++) {
                    _loop_1(i);
                }
                return [4 /*yield*/, Promise.all(tasks)];
            case 1:
                result = _d.sent();
                console.log(result);
                LIMIT = 10;
                _b = (_a = console).log;
                _c = ["batchSync"];
                return [4 /*yield*/, batchSync([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])];
            case 2:
                _b.apply(_a, _c.concat([_d.sent()]));
                return [2 /*return*/];
        }
    });
}); })();

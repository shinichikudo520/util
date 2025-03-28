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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _this = this;
(function () { return __awaiter(_this, void 0, void 0, function () {
    /**
     * 让指定数量的异步同时进行, 并发处理, 提高批量异步的需求的速度
     *    比一个个异步请求, await, 速度约提高 2-3 倍
     * @param datas
     * @returns
     */
    function concurrent(datas) {
        return __awaiter(this, void 0, void 0, function () {
            var tasks, temp;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tasks = [];
                        return [4 /*yield*/, splitBulk(LIMIT, datas, function (arr) { return __awaiter(_this, void 0, void 0, function () {
                                var p;
                                return __generator(this, function (_a) {
                                    p = new Promise(function (resolve) {
                                        resolve(arr);
                                    });
                                    tasks.push(p);
                                    return [2 /*return*/];
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, Promise.all(tasks)];
                    case 2:
                        temp = _a.sent();
                        return [2 /*return*/, temp];
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
    /**
     * 并发: 没有补位功能
     *  与 concurrent 相比, 其实就是将分割函数封装起来了, 可以由外部传入指定的分割函数
     *  将数据使用传入的分割函数 split 进行分割后, 调用回调 callback 返回一个 promise
     *  tasks 接收所有 promise, 并发处理, 等待所有 promise 完成后返回
     * @param limits 分割限制
     * @param datas 数据
     * @param split 分割函数
     * @param callback 针对分割后的数据进行处理的函数, 需要返回一个 promise
     * @returns
     */
    function concurrent1(limits, datas, split, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var tasks, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tasks = [];
                        return [4 /*yield*/, split.apply(this, __spreadArray(__spreadArray([], limits, true), [
                                datas,
                                function (subDatas) { return tasks.push(callback(subDatas)); },
                            ], false))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, Promise.all(tasks)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    }
    /**
     * 并发: 可以补位
     *  按照指定 limit 数量并发处理异步, 当某一个完成, 则下一个异步进入, 直到异步并发数量 == limit
     * @param limit 指定每次最大并发数量
     * @returns
     */
    function concurrent2(limit) {
        var _this = this;
        var queue = [];
        var activeCount = 0;
        var next = function () {
            activeCount--;
            if (queue.length > 0) {
                queue.shift()();
            }
        };
        var run = function (fn, resolve) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            return __awaiter(_this, void 0, void 0, function () {
                var result, res, error_1;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            activeCount++;
                            result = (function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                return [2 /*return*/, fn.apply(void 0, args)];
                            }); }); })();
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, result];
                        case 2:
                            res = _a.sent();
                            resolve(res);
                            return [3 /*break*/, 4];
                        case 3:
                            error_1 = _a.sent();
                            return [3 /*break*/, 4];
                        case 4:
                            next();
                            return [2 /*return*/];
                    }
                });
            });
        };
        var enqueue = function (fn, resolve) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            queue.push(run.bind.apply(run, __spreadArray([null, fn, resolve], args, false)));
            if (activeCount < limit && queue.length > 0) {
                queue.shift()();
            }
        };
        var generator = function (fn) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            /** 必须将参数深拷贝, 否则并发时, 引用数据类型可能会受影响, 导致数据混乱 */
            var _args = deepClone(args);
            return new Promise(function (resolve) { return enqueue.apply(void 0, __spreadArray([fn, resolve], _args, false)); });
        };
        return generator;
    }
    function deepClone(obj) {
        if (typeof obj !== "object" ||
            obj === null ||
            obj instanceof Date ||
            obj instanceof ArrayBuffer ||
            obj instanceof FormData) {
            return obj;
        }
        else {
            if (Array.isArray(obj)) {
                return obj.map(deepClone);
            }
            else {
                var obj2 = {};
                for (var key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                        obj2[key] = deepClone(obj[key]);
                    }
                }
                return obj2;
            }
        }
    }
    //  ------------------ COMPLETE
    /**
     * 并发: 可以补位(继续封装)
     *  按照指定 limit 数量并发处理异步, 当某一个完成, 则下一个异步进入, 直到异步并发数量 == limit
     * @param limit 指定每次最大并发数量
     * @param callback 需要并发的异步函数
     * @param limit 并发函数需要的参数
     * @returns
     */
    function concurrent3(limit, callback, args) {
        return __awaiter(this, void 0, void 0, function () {
            var generator, tasks, _i, args_1, arg, _arg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        generator = concurrent2(limit);
                        tasks = [];
                        for (_i = 0, args_1 = args; _i < args_1.length; _i++) {
                            arg = args_1[_i];
                            _arg = Array.isArray(arg) ? arg : [arg];
                            tasks.push(generator.apply(void 0, __spreadArray([callback], _arg, false)));
                        }
                        return [4 /*yield*/, Promise.all(tasks)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    }
    var tasks, _loop_1, i, result, arr, LIMIT, _a, _b, _c, temp, promises, generator, temp1, p, temp2;
    var _this = this;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                tasks = [];
                _loop_1 = function (i) {
                    var p_1 = new Promise(function (resolve) {
                        resolve(i);
                    });
                    tasks.push(p_1);
                };
                for (i = 0; i < 10; i++) {
                    _loop_1(i);
                }
                return [4 /*yield*/, Promise.all(tasks)];
            case 1:
                result = _d.sent();
                console.log(result);
                arr = [
                    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
                ];
                LIMIT = 10;
                // [test concurrent]
                _b = (_a = console).log;
                _c = ["concurrent"];
                return [4 /*yield*/, concurrent(arr)];
            case 2:
                // [test concurrent]
                _b.apply(_a, _c.concat([_d.sent()])); // [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [11, 12, 13, 14, 15, 16, 17, 18, 19, 20]]
                return [4 /*yield*/, concurrent1.call(this, [LIMIT], arr, splitBulk, function (subDatas) {
                        var p = new Promise(function (resolve) {
                            resolve(subDatas);
                        });
                        return p;
                    })];
            case 3:
                temp = _d.sent();
                console.log("concurrent1", temp); // [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [11, 12, 13, 14, 15, 16, 17, 18, 19, 20]]
                promises = [];
                generator = concurrent2(2);
                return [4 /*yield*/, splitBulk(LIMIT, arr, function (subDatas) {
                        var p = function () {
                            return new Promise(function (resolve) {
                                resolve(subDatas);
                            });
                        };
                        promises.push(generator(p));
                    })];
            case 4:
                _d.sent();
                return [4 /*yield*/, Promise.all(promises)];
            case 5:
                temp1 = _d.sent();
                console.log("concurrent2", temp1); // [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [11, 12, 13, 14, 15, 16, 17, 18, 19, 20]]
                p = function (num) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [2 /*return*/, num];
                    });
                }); };
                return [4 /*yield*/, concurrent3(2, p, arr)];
            case 6:
                temp2 = _d.sent();
                console.log("concurrent3", temp2); // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
                return [2 /*return*/];
        }
    });
}); })();

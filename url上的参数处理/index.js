(() => {
  if (!location.search) {
    location.href = location.href + `?aaa=123&bbb=456&ccc=789`;
  }

  // 获取 url 上的参数
  function getUrlParams(key) {
    const search = new URLSearchParams(window.location.search);
    return search.get(key);
  }

  console.log("url 上参数 aaa 的值是:", getUrlParams("aaa"));
  console.log("url 上参数 bbb 的值是:", getUrlParams("bbb"));
  console.log("url 上参数 ccc 的值是:", getUrlParams("ccc"));

  // 删除 url 上的参数
  function removeUrlParams(key) {
    let href = location.href;
    const e = eval(`/&?${key}=[^&#]*/g`);
    href = href.replace(e, "");
    /**
     *
     * state object —— 状态对象是一个由 replaceState()方法创建的、与历史纪录相关的javascript对象。当用户定向到一个新的状态时，会触发popstate事件。事件的state属性包含了历史纪录的state对象。如果不需要这个对象，此处可以填null
     * title —— 新页面的标题，但是所有浏览器目前都忽略这个值，因此这里可以填null
     * url —— 这个参数提供了新历史纪录的地址。新URL必须和当前URL在同一个域，否则，replaceState()将丢出异常。这个参数可选，如果它没有被特别标注，会被设置为文档的当前URL
     */
    history.replaceState("", "", href); // replaceState 方法不会触发页面刷新，只是导致history对象发生变化，地址栏会有反应
  }

  // 移除 bbb 的值
  removeUrlParams("bbb");
  console.log("移除 bbb 后, url 上参数 bbb 的值是:", getUrlParams("bbb"));
})();

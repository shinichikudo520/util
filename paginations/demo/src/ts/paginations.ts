/**
 * 翻页组件 Pagination 构造函数参数接口
 * @param  element 分页组件容器节点
 * @param  currentPage 当前页
 * @param  pageSize 每一页的数据量
 * @param  totalNumber 数据总数
 * @param  previousPromise 点击前一页执行的异步函数
 * @param  nextPromise 点击后一页执行的异步函数
 * @param  toPagePromise 跳转指定页执行的异步函数
 * @param  pageSizeChangePromise 切换页数配置执行的异步函数
 * @param  className 容器指定类名
 * @param  data 传递的一些数据（需要记录的一些数据, 先在实例中记录）
 * @param  pageSizeConfig 页数的配置
 */
interface PaginationOptions {
  element: HTMLElement;
  currentPage: number;
  pageSize: number;
  totalNumber: number;
  previousPromise: (page: number, pageSize: number) => Promise<any>;
  nextPromise: (page: number, pageSize: number) => Promise<any>;
  toPagePromise?: (page: number, pageSize: number) => Promise<any>;
  pageSizeChangePromise?: (
    oldSize: number,
    currentSize: number
  ) => Promise<any>;
  className?: string;
  data?: any;
  pageSizeConfig?: boolean | number[];
}

export class Pagination {
  private element: HTMLElement;
  private currentPage: number;
  private totalNumber: number;
  private pageNumber: number;
  private className: string;
  private pageSize: number;
  private paginationEle: HTMLElement;
  private pageSizeConfig: number[];
  private previousPromise: (page: number, pageSize: number) => Promise<any>;
  private nextPromise: (page: number, pageSize: number) => Promise<any>;
  private toPagePromise?: (page: number, pageSize: number) => Promise<any>;
  private pageSizeChangePromise?: (
    oldSize: number,
    currentSize: number
  ) => Promise<any>;
  public data: any;
  static paginationList: Pagination[] = [];
  readonly DEFAULT_PAGE_CONFIG = [10, 20, 50, 100, 150]; // 默认页数配置

  /**
   * 检查在容器节点中是否已经存在翻页组件
   * @param element 容器节点
   * @returns {boolean}
   */
  static isRepeat(element: HTMLElement): boolean {
    return !!element.querySelector("div[data-pagination]");
  }

  /**
   * 组件初始化
   * @param options
   */
  private init(options: PaginationOptions) {
    this.element = options.element;
    this.currentPage = options.currentPage;
    this.pageSize = options.pageSize;
    this.totalNumber = options.totalNumber;
    this.pageNumber = Math.ceil(this.totalNumber / this.pageSize);
    this.className = options.className || "default-pagination";
    this.previousPromise = options.previousPromise;
    this.nextPromise = options.nextPromise;
    this.toPagePromise = options.toPagePromise;
    this.pageSizeChangePromise = options.pageSizeChangePromise;
    this.pageSizeConfig = options.pageSizeConfig
      ? Array.isArray(options.pageSizeConfig)
        ? options.pageSizeConfig
        : this.DEFAULT_PAGE_CONFIG
      : [];
    this.data = options.data || null;

    this.paginationEle = this.domGenerate();
    this.paginationChange();
    this.eventListener();
    this.addPagination(this);
  }

  constructor(options: PaginationOptions) {
    if (Pagination.isRepeat(options.element)) {
      throw new Error("Pagination：无法在同一DOM容器内构建重复的翻页组件!");
    }
    this.init(options);
  }
  /**
   * 根据翻页组件容器节点获取其相关实例
   * @param element 容器节点
   * @returns
   */
  static getPaginationByElement(element: HTMLElement): Pagination | null {
    for (const pagination of this.paginationList) {
      if (pagination.element === element) {
        return pagination;
      }
    }
    return null;
  }
  /**
   * 向翻页组件实例列表中添加实例
   * @param pagination 组件实例
   */
  private addPagination(pagination: Pagination) {
    if (pagination instanceof Pagination) {
      Pagination.paginationList.push(pagination);
    }
  }
  /**
   * 移除指定翻页实例
   * @param pagination 组件实例
   */
  private removePagination(pagination: Pagination) {
    const list = Pagination.paginationList;
    for (let i = 0; i < list.length; i++) {
      if (list[i] === pagination) {
        list.splice(i, 1);
      }
    }
  }
  /**
   * 组件内事件监听
   */
  private eventListener() {
    const previousPageEle = this.paginationEle.querySelector(".toPrevious");
    const nextPageEle = this.paginationEle.querySelector(".toNext");
    const currentPageEle = this.paginationEle.querySelector(".currentPage-box");
    const pageConfigEle = this.paginationEle.querySelector(
      'select[name="page_size_config"]'
    );

    // 点击向前翻页的按钮
    previousPageEle?.addEventListener("click", () => {
      this.turning();
      this.previousPromise(this.currentPage - 1, this.pageSize).then(() => {
        this.goPrevious();
      });
    });

    // 点击向后翻页按钮
    nextPageEle?.addEventListener("click", () => {
      this.turning();
      this.nextPromise(this.currentPage + 1, this.pageSize).then(() => {
        this.goNext();
      });
    });

    // 失去焦点后恢复翻页组件样式
    currentPageEle?.addEventListener("blur", () => {
      (this.paginationEle.querySelector(".currentPage-box") as HTMLElement)
        .isContentEditable && this.paginationChange();
    });

    // 记录 activeElement
    let activeElement: Element | null = null;
    currentPageEle?.addEventListener("mousedown", () => {
      activeElement = document.activeElement;
    });

    // 点击时正确放置光标, 选中当前页码输入框时, 自动选中页码文本
    currentPageEle?.addEventListener("click", () => {
      if (
        (currentPageEle as HTMLElement).isContentEditable &&
        activeElement !== currentPageEle
      ) {
        let range = document.createRange(); // 选中元素前创建 range 对象
        range.selectNodeContents(currentPageEle); // 设定range包含的节点对象
        /**
         * range.collapse(toStart);
         * toStart?:boolean true 折叠到 Range 的 start 节点，false 折叠到 end 节点。如果省略，则默认为 false
         * 折叠后的 Range 为空，不包含任何内容。
         * 确定 Range 是否已折叠，使用Range.collapsed 属性。
         */
        range.collapse(true);
        range.setEnd(currentPageEle, currentPageEle.childNodes.length); // 设定选中终点
        range.setStart(currentPageEle, 0); // 设定选中起点

        let sel = window.getSelection(); // 窗口的 selection 对象，表示用户选择的文本
        sel?.removeAllRanges(); // 将已经包含的已选择的对象清除掉
        sel?.addRange(range); // 将范围内的元素选中（加入到 selection 对象）
      }
    });

    // 回车直达输入页
    currentPageEle?.addEventListener("keydown", (e) => {
      if ((e as KeyboardEvent).keyCode === 13) {
        e.preventDefault();
        toPage.bind(this)();
      }
    });

    // 输入完成后检测输入是否正确并处理
    currentPageEle?.addEventListener("keyup", () => {
      const currentValue = currentPageEle.innerHTML;
      if (!/^[1-9]+[0-9]*$/.test(currentValue)) {
        currentPageEle.innerHTML = currentValue.substring(
          0,
          currentValue.length - 1
        );
      }

      if (parseInt(currentPageEle.innerHTML, 10) > this.getPageNumber()) {
        currentPageEle.innerHTML = this.getPageNumber().toString();
      }

      if (parseInt(currentPageEle.innerHTML, 10) === 0) {
        currentPageEle.innerHTML = "1";
      }
    });

    // 切换页数配置
    pageConfigEle?.addEventListener("change", () => {
      const oldSize = this.pageSize;
      this.reload(
        this.totalNumber,
        Number((pageConfigEle as HTMLSelectElement).value),
        1,
        this.data
      );
      if (this.pageSizeChangePromise) {
        this.pageSizeChangePromise(oldSize, this.pageSize);
      } else {
        toPage.bind(this)();
      }
    });

    // 跳转到输入框指定页
    function toPage() {
      const page =
        parseInt(currentPageEle?.innerHTML as string, 10) || this.currentPage;
      if (page && this.toPagePromise) {
        this.turning();
        this.toPagePromise(page, this.pageSize).then(() => {
          this.toPageNumber(page);
          (currentPageEle as HTMLElement).blur();
        });
      }
    }
  }
  /**
   * 在翻页过程中, 需要防止用户操作, 这在长时间的异步翻页等待过程中是非常有必要的
   */
  private turning() {
    const currentPageEle = this.paginationEle.querySelector(".currentPage-box");
    const previousPageEle = this.paginationEle.querySelector(".toPrevious");
    const nextPageEle = this.paginationEle.querySelector(".toNext");
    const pageConfigEle = this.paginationEle.querySelector(
      'select[name="page_size_config"]'
    );

    (
      currentPageEle as HTMLElement
    ).innerHTML = `<span style='display:inline-block' class='icon-eda-loading rotation'></span>`;
    (currentPageEle as HTMLElement).contentEditable = "false";
    previousPageEle?.setAttribute("disabled", "disabled");
    nextPageEle?.setAttribute("disabled", "disabled");
    pageConfigEle?.setAttribute("disabled", "disabled");
  }
  /**
   * 翻页组件 dom 节点生成
   * @returns
   */
  private domGenerate(): HTMLElement {
    const element = document.createElement("div");
    const currentPageSize = this.getCurrentPageSize();

    element.setAttribute("data-pagination", "");
    element.classList.add(this.className);
    element.innerHTML = `
    ${this.getPageConfigDomStr()}
   
    <span class='pageNumber-box'>Total <text class='value'> ${
      this.pageNumber
    }</text> page(s), </span>
    <span class='totalNumber-box'><text class='value'>${
      this.totalNumber
    }</text> record(s) </span>
    <span class='pageSize-box ${
      this.pageSizeConfig.length ? "hidden" : ""
    }'>, current page count: <text class='value'>${currentPageSize}</text> </span>
    <button class="default-btn toPrevious self-adaption">
      <span>&lt;</span>
    </button>
    <span class='currentPage-box'>${this.currentPage}</span>
    <button class="default-btn toNext self-adaption">
      <span>&gt;</span>
    </button>
    `;

    if (Pagination.isRepeat(this.element)) {
      this.element.removeChild(
        this.element.querySelector("div[data-pagination]") as any
      );
    }

    if (this.toPagePromise) {
      (
        element.querySelector(".currentPage-box") as HTMLElement
      ).contentEditable = "true";
    }

    this.element.appendChild(element);

    return element;
  }
  /**
   * 获取切页数配置的下拉框 dom
   * @returns
   */
  private getPageConfigDomStr() {
    const pageConfig = Array.from(
      new Set(this.pageSizeConfig.concat(this.pageSize))
    );
    let options = "";

    for (const size of pageConfig) {
      options += `
        <option value="${size}" ${
        this.pageSize === size ? "selected" : ""
      } >${size}/page </option>
      `;
    }

    return `<select clase"${
      this.pageSizeConfig.length ? "" : "hidden"
    }" name='page_size_config'>${options}</select>`;
  }
  /**
   * 当前是否无数据
   * @returns
   */
  private isNoPage(): boolean {
    return this.pageNumber === 0;
  }
  /**
   * 当前是否是最后一页
   */
  private isEndPage(): boolean {
    return this.currentPage === this.pageNumber;
  }
  /**
   * 当前是否是首页
   */
  private isFirstPage(): boolean {
    return this.currentPage === 1;
  }

  /**
   * 翻页组件视图变化
   */
  private paginationChange() {
    const currentPageEle = this.paginationEle.querySelector(".currentPage-box");
    const pageSizeEle = this.paginationEle.querySelector(
      ".pageSize-box"
    ) as HTMLElement;
    const pageNumberEle = this.paginationEle.querySelector(
      ".pageNumber-box"
    ) as HTMLElement;
    const previousPageEle = this.paginationEle.querySelector(".toPrevious");
    const nextPageEle = this.paginationEle.querySelector(".toNext");
    const totalNumberEle = this.paginationEle.querySelector(
      ".totalNumber-box"
    ) as HTMLElement;
    const pageConfigEle = this.paginationEle.querySelector(
      'select[name="page_size_config"]'
    );

    if (this.isEndPage()) {
      nextPageEle?.setAttribute("disabled", "disabled");
    } else {
      nextPageEle?.removeAttribute("disabled");
    }

    if (this.isFirstPage()) {
      previousPageEle?.setAttribute("disabled", "disabled");
    } else {
      previousPageEle?.removeAttribute("disabled");
    }

    if (this.toPagePromise) {
      (currentPageEle as HTMLElement).contentEditable = "true";
    }

    pageConfigEle?.removeAttribute("disabled");

    if (this.isNoPage()) {
      nextPageEle?.setAttribute("disabled", "disabled");
      previousPageEle?.setAttribute("disabled", "disabled");
      (currentPageEle as HTMLElement).contentEditable = "false";
      pageConfigEle?.setAttribute("disabled", "disabled");
    }

    (currentPageEle as HTMLElement).innerHTML = this.isNoPage()
      ? "0"
      : this.currentPage.toString();
    (pageNumberEle.querySelector(".value") as HTMLElement).innerHTML =
      this.pageNumber.toString();
    (totalNumberEle.querySelector(".value") as HTMLElement).innerHTML =
      this.totalNumber.toString();
    (pageSizeEle.querySelector(".value") as HTMLElement).innerHTML =
      this.getCurrentPageSize().toString();
    (pageConfigEle as HTMLSelectElement).value = this.pageSize.toString();
  }
  /**
   * 获取当前页内容数量
   */
  private getCurrentPageSize(): number {
    const traceNum = this.totalNumber - (this.currentPage - 1) * this.pageSize;
    if (traceNum > this.pageSize) {
      return this.pageSize;
    } else {
      return traceNum;
    }
  }
  /**
   * 去上一页
   */
  private goPrevious() {
    if (!this.isFirstPage()) {
      this.currentPage--;
      this.paginationChange();
    }
  }
  /**
   * 去下一页
   */
  private goNext() {
    if (!this.isEndPage()) {
      this.currentPage++;
      this.paginationChange();
    }
  }

  /**
   * 去到指定页
   * @param page 指定页码
   */
  public toPageNumber(page: number) {
    if (page < 1 || page > this.getPageNumber()) {
      throw new Error("Pagination: 页数错误");
    }
    this.currentPage = page;
    this.paginationChange();
  }
  /**
   * 获取总条数
   */
  public getTotalNumber(): number {
    return this.totalNumber;
  }
  /**
   * 获得总页数
   */
  public getPageNumber(): number {
    return this.pageNumber;
  }
  /**
   * 获得一页容量
   */
  public getPageSize(): number {
    return this.pageSize;
  }
  /**
   * 获得当前页
   */
  public getCurrentPage(): number {
    return this.currentPage;
  }
  /**
   * 重新建立翻页组件数据
   * @param totalNumber
   * @param pageSize
   * @param currentPage
   * @param data
   */
  public reload(
    totalNumber: number,
    pageSize: number,
    currentPage: number,
    data?: any
  ) {
    this.currentPage = currentPage;
    this.pageSize = pageSize;
    this.totalNumber = totalNumber;
    this.pageNumber = Math.ceil(totalNumber / pageSize);

    if (data) {
      this.data = data;
    }

    this.paginationChange();
  }
  /**
   * 销毁
   */
  public destroy() {
    // 销毁 dom
    const ele = this.element.querySelector("[data-pagination]");
    ele?.parentNode?.removeChild(ele);

    // 销毁实例
    this.removePagination(this);
    // 再使用此对象实例应该报错
    for (const key of Object.keys(this)) {
      this[key] = undefined;
    }
  }
}

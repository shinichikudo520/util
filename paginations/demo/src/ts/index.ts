import { Pagination } from "./paginations";

const DEFAULT_PAGE_CONFIG = [50, 100, 150, 200];
export default function init(
  totalNumber: number,
  pageSize?: number,
  currentPage?: number
) {
  console.log("init...");

  let curPage = 1;
  let curPageSize = 50;
  const ele = document.querySelector("#paginationContainer") as HTMLElement;
  let pagination: Pagination;
  if (!Pagination.isRepeat(ele)) {
    pagination = new Pagination({
      element: ele as HTMLElement,
      totalNumber,
      pageSize: pageSize || curPageSize,
      currentPage: currentPage || curPage,
      pageSizeConfig: DEFAULT_PAGE_CONFIG,
      previousPromise: (page, pageSize) => {
        return pagePromise(page, pageSize);
      },
      nextPromise: (page, pageSize) => {
        return pagePromise(page, pageSize);
      },
      toPagePromise: (page, pageSize) => {
        return pagePromise(page, pageSize);
      },
    });
  } else {
    pagination = Pagination.getPaginationByElement(ele) as Pagination;
    pagination?.reload(
      totalNumber,
      pageSize || curPageSize,
      currentPage || curPage
    );
  }

  async function pagePromise(page: number, pageSize: number) {
    // todo...
    console.log("do something");
    curPage = page;
    curPageSize = pageSize;
  }
}

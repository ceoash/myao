import { useRouter, useSearchParams } from "next/navigation";
import React, { Dispatch, use, useEffect } from "react";

const Pagination = ({
  page,
  total,
  limit,
  setPage,
  pages,
  model,
  setIsLoading,
}: {
  page: number;
  total: number;
  limit: number;
  setPage?:
    | ((num: number) => void | Dispatch<React.SetStateAction<number>>)
    | undefined
    | null;
  pages?: number | null | undefined;
  viewCount?: number;
  model?: string;
  setIsLoading?: Dispatch<React.SetStateAction<boolean>>;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeClass =
    "w-10 h-10 relative z-10 inline-flex items-center bg-orange-500 text-xs font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600";
  const defaultClass =
    "w-10 h-10 relative inline-flex items-center text-xs font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0";
  const allPages = Math.ceil(total / limit);
  const pagesArr = Array.from(Array(allPages).keys());

  const [currentPage, setCurrentPage] = React.useState(page);
  const [showing, setShowing] = React.useState(0);
  const [to, setTo] = React.useState(0);

  React.useEffect(() => {
    setCurrentPage(page);
    setTo(
      total > limit ? (page * limit < total ? page * limit : total) : total
    );
    setShowing(page > 1 ? (page - 1) * 10 + 1 : 1);

    console.log("pagination mounted");
  }, [page, total, limit]);

  const goToPage = (num: number) => {
    if (setPage) {
      setCurrentPage(num);
      setTo(
        total > limit ? (num * limit < total ? num * limit : total) : total
      );
      setShowing(num > 1 ? (num - 1) * 10 + 1 : 1);
      setPage(num);
      return;
    } else if (pages && page && model) {
      const pageParam = searchParams.get("page")
        ? parseInt(searchParams.get("page") as string)
        : 1;

      const paramsWithPage = new URLSearchParams(searchParams.toString());
      paramsWithPage.set("page", num.toString());
      const newParams = paramsWithPage.toString();
      router.push(`/${model}s?${newParams}`);
      setCurrentPage(num);
      setTo(
        total > limit ? (num * limit < total ? num * limit : total) : total
      );
      setShowing(num > 1 ? (num - 1) * 10 + 1 : 1);
      return;
    }
    return console.log("no page");
  };

  const goBack = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
      setCurrentPage(currentPage - 1);
      setTo(
        total > limit
          ? currentPage * limit < total
            ? currentPage * limit
            : total
          : total
      );
      setShowing(currentPage > 1 ? (currentPage - 1) * 10 + 1 : 1);
      return;
    } else if (pages && page && model) {
      router.back();
      setCurrentPage(currentPage - 1);
      setTo(
        total > limit
          ? currentPage * limit < total
            ? currentPage * limit
            : total
          : total
      );
      setShowing(currentPage > 1 ? (currentPage - 1) * 10 + 1 : 1);
      return;
    }
    return console.log("no page");
  };

  const goForward = () => {
    if (currentPage < allPages) {
      goToPage(currentPage + 1);
      return;
    } else if (pages && page && model) {
      router.push(`/${model}s?page=${currentPage + 1}`);
      return;
    }
    return console.log("no page");
  };

  useEffect(() => {
    if (setIsLoading) {
      setIsLoading(false);
    }
  }, [currentPage]);

  const currentPagesArr = pagesArr;
  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <a
          href="#"
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          onClick={() => goBack()}
        >
          Previous
        </a>
        <a
          href="#"
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          onClick={() => goForward()}
        >
          Next
        </a>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing
            <span className="font-medium px-1">{showing}</span>
            to
            <span className="font-medium px-1">{to}</span>
            of
            <span className="font-medium px-1">{total}</span>
            results
          </p>
        </div>
        <div>
          <nav
            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            <button
              type="button"
              className={`relative inline-flex items-center rounded-l-md px-2 py-2 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                currentPage > 1 ? "" : "no-interaction"
              }`}
              onClick={currentPage > 1 ? () => goBack() : () => {}}
            >
              <span className="sr-only">Previous</span>
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {currentPagesArr.map((idx) => {
              if (idx + 1 > allPages) {
                return null;
              }
              if (
                idx + 1 !== 1 &&
                idx + 1 !== allPages &&
                idx + 1 < currentPage
              ) {
                return null;
              }
              if (
                idx + 1 !== 1 &&
                idx + 1 !== allPages &&
                idx + 1 >= currentPage + 9
              ) {
                return null;
              }

              return (
                <button
                  type="button"
                  key={idx}
                  className={
                    idx + 1 === currentPage ? activeClass : defaultClass
                  }
                  onClick={() => goToPage(idx + 1)}
                >
                  <span className="flex items-center justify-center w-full">
                    {idx + 1}
                  </span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={currentPage < allPages ? () => goForward() : () => {}}
              className={`relative inline-flex items-center rounded-r-md px-2 py-2 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                currentPage < allPages ? "" : "no-interaction"
              }`}
            >
              <span className="sr-only">Next</span>
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;

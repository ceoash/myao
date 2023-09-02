import Link from "next/link";
import { useRouter } from "next/router";



const Breadcrumb = ({pageTitle, dashboard}: {pageTitle?: string, dashboard?: boolean}) => {
  const router = useRouter();
  const { asPath } = router;
  const pathParts = asPath.split("/").filter(Boolean);

  return (
    <ol className="inline-flex items-center space-x-1 md:space-x-3 ">
      <li className="inline-flex items-center">
        <Link
          href={`/dashboard/`}
          className={`inline-flex items-center font-medium hover:text-orange-600 text-sm md:text-md md:font-bold ${
            pathParts.length === 1 ? "text-gray-700" : "text-gray-500"
          }`}
        >
        <span>
          <svg
              className="w-3 h-3 mr-1 md:mr-2.5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
            </svg>
        </span>
        <span>Dashboard</span>
        </Link>
      </li>
      {pathParts[1] && (
      <li className="inline-flex items-center">
        <Link
          href={`/dashboard/${pathParts[1]}`}
          className={`inline-flex items-center text-sm md:text-md md:font-bold font-medium hover:text-orange-600 ${
            pathParts.length === 2 ? "text-gray-700" : "text-gray-500"
          }`}
        >
          <span>
            <svg
              className="w-3 h-3 mr-1 md:mr-2.5 text-gray-400 mx-1"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 6 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 9 4-4-4-4"
              />
            </svg>
          </span>
          <span className="capitalize">{pathParts[1]}</span>
        </Link>
      </li>
      )}
      
      <li className="inline-flex items-center">
        <Link
          href={`#`}
          className={`inline-flex items-center capitalize  font-medium text-sm md:text-md md:font-bold ${
            pathParts.length === 3 || pageTitle ? "text-gray-700" : "text-gray-500"
          }`}
        >
         <span>
            <svg
              className="w-3 h-3 mr-1 md:mr-2.5 text-gray-400 mx-1"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 6 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 9 4-4-4-4"
              />
            </svg>
          </span>
          <span className={`inline-flex items-center  font-medium text-sm md:text-md md:font-bold ${
            pathParts.length === 3 ? "text-gray-700" : "text-gray-500"
          }` }>{pathParts.length < 4 && pageTitle ? pageTitle : pathParts[2].split("?")[0]}</span>
        </Link>
      </li>
      
    </ol>
  );
};

export default Breadcrumb;

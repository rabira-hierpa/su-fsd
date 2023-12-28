"use client";
import React, { useEffect, useState } from "react";
import Loading from "./components/shared/Loading";
import Error from "./components/shared/Error";
import { CSVData } from "./types/csvData";
import extractNumber from "./utils/extractNumber";

export default function Home() {
  const [data, setData] = useState<CSVData[] | undefined>([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("/api/getData", {
      next: {
        revalidate: 3600, // Revalidate after 1 hour
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setData(data);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => setLoading(false));
  }, []);

  async function getSortedData(params: string) {
    switch (params) {
      case "createdAt":
        const sortedData = data?.toSorted((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });
        return sortedData;
      case "fileNameAscend":
        const ascendSorted = data?.toSorted((a: any, b: any) => {
          const numA = extractNumber(a.file_name);
          const numB = extractNumber(b.file_name);
          if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB || a.file_name.localeCompare(b.file_name);
          } else {
            return a.file_name.localeCompare(b.file_name);
          }
        });
        return ascendSorted;
      case "fileNameDescend":
        const descendSorted = data?.toSorted((a: any, b: any) => {
          const numA = extractNumber(a.file_name);
          const numB = extractNumber(b.file_name);
          if (!isNaN(numA) && !isNaN(numB)) {
            return numB - numA || b.file_name.localeCompare(a.file_name);
          } else {
            return b.file_name.localeCompare(a.file_name);
          }
        });
        return descendSorted;
      default:
        break;
    }
  }

  const sortByParams = (param: string) => {
    setLoading(true);
    getSortedData(param)
      .then((data) => {
        setData(data);
      })
      .catch((err) => {
        console.log(error);
        setError(err);
      })
      .finally(() => setLoading(false));
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error />;
  }

  return (
    <main className="flex flex-col bg-slate-800 h-screen text-white">
      <div className="mx-auto flex items-center my-5 space-x-10">
        <div className="">
          <button className="flex space-x-2 items-center p-2 font-bold text-gray-100 rounded-xl peer  transition-all duration-200 border-2 px-6 py-2 w-auto ">
            <p>Sort by</p>
            <svg
              className="-mr-1 h-5 w-5 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <div className=' w-80 absolute top-12 z-10 after:content-[""] after:inline-block after:absolute after:top-0 after:bg-black/90 after:w-full after:h-full after:-z-20 after:blur-[2px] after:rounded-lg peer-focus:top-12 peer-focus:opacity-100 peer-focus:visible transition-all duration-300 invisible  opacity-0 '>
            <ul className="py-6 px-3 flex flex-col gap-3">
              <li
                onClick={() => {
                  sortByParams("createdAt");
                }}
                className="cursor-pointer hover:text-blue-400"
              >
                Sort by created at ascendent
              </li>
              <li
                onClick={() => {
                  sortByParams("fileNameAscend");
                }}
                className="cursor-pointer hover:text-blue-400"
              >
                Sort by filename ascendent
              </li>
              <li
                onClick={() => {
                  sortByParams("fileNameDescend");
                }}
                className="cursor-pointer hover:text-blue-400"
              >
                Sort by filename descendent
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="flex mx-auto mt-10">
        {!data?.length && (
          <h1 className="flex mx-auto text-2xl">No data to display</h1>
        )}
        <div className="grid grid-cols-2 gap-10 max-w-5xl">
          {data?.map((item: CSVData) => {
            return (
              <div
                key={item.date}
                className="flex flex-col border-2 rounded-xl border-slate-200 px-10 py-5 space-y-2"
              >
                <p className="text-sm">
                  {new Date(item.date)
                    .toISOString()
                    .slice(0, 10)
                    .replace(/-/g, "/")}
                </p>
                <p className="text-xl">{item.file_name}</p>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

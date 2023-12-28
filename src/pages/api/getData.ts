import csvtojson from "csvtojson";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";

const csvFilePath = path.join(process.cwd(), "src/data.csv");

async function getJsonData() {
  return await csvtojson({ delimiter: ";" }).fromFile(csvFilePath);
}

function extractNumber(str: string) {
  const match = str.match(/(\d+)/);
  return match ? parseInt(match[0], 10) : NaN;
}

async function getSortedData(params: string) {
  switch (params) {
    case "createdAt":
      const jsonFile = await getJsonData();
      const sortedData = jsonFile.toSorted((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });
      return sortedData;
    case "fileNameAscend":
      const jsonArray1 = await getJsonData();
      const ascendSorted = jsonArray1.toSorted((a: any, b: any) => {
        return a.file_name.localeCompare(b.file_name);
      });
      return ascendSorted;
    case "fileNameDescend":
      const jsonArray2 = await getJsonData();
      const descendSorted = jsonArray2.toSorted((a: any, b: any) => {
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "GET":
        const jsonData = await getJsonData();
        res.status(200).json(jsonData);
        break;
      case "POST":
        const queryParam = req.body.sortBy;
        const sortedData = await getSortedData(queryParam);
        res.status(200).json(sortedData);
        break;
      default:
        res.status(405).end(); // method not allowed
        break;
    }
  } catch (error) {}
}

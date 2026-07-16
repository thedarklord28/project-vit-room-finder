import React, { useState, useEffect } from 'react'
import classData from "../../rawdata/mockffcs.json" 

export default function Live() {
    // Correctly targets the keys of the first item in the data array
    const columns = classData && classData.length > 0 ? Object.keys(classData[0]) : [];

    useEffect(() => {
        console.log("Extracted Columns:", columns);
    }, [columns]);

    return (
        <div className="w-screen h-screen bg-gray-500 p-8 flex flex-col gap-4 text-white">
            <h1 className="text-2xl font-bold">Data Columns</h1>
            
            <ul className="list-disc pl-6 bg-gray-700 p-4 rounded shadow-md max-w-md">
                {columns.map((colName, index) => (
                    <li key={index} className="py-1 capitalize font-medium">
                        {colName}
                    </li>
                ))}
            </ul>
        </div>
    )
}

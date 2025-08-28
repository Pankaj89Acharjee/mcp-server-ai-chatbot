import React from "react";
import { motion } from "framer-motion";
import { IconDownload } from "@tabler/icons-react";

export const FileUpload = ({
    isReportReadForStation,
    isReportReadyForJob,
    onDownloadStation,
    onDownloadJob,
    selectedValueRefStation,
    selectedValueRefJob,
    mode,
}) => {

    // console.log("isRportForStation in FILEUPLOAD", isReportReadForStation)
    // console.log("isReportReadyForJob in FILEUPLOAD", isReportReadyForJob)

    // Determine the props to use based on the mode
    const isReportReady = mode === "station" ? isReportReadForStation : isReportReadyForJob;
    const onDownload = mode === "station" ? onDownloadStation : onDownloadJob;
    const selectedValueRef = mode === "station" ? selectedValueRefStation : selectedValueRefJob;

    if (!mode) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 dark:text-gray-300">No report selected yet.</p>
            </div>
        );
    }

    return (
        <div className="w-full relative overflow-hidden">
            <motion.div className="p-10 block rounded-lg cursor-pointer w-full relative overflow-hidden">
                {/* Animated background effect */}
                <motion.div
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: 1 }}
                    animate={{ opacity: 0.3, scale: 1.05 }}
                    transition={{ duration: 1, repeat: Infinity, repeatType: "mirror" }}
                >
                    <GridPattern />
                </motion.div>

                <div className="relative flex flex-col items-center justify-center">
                    <p className="relative z-20 font-sans font-bold text-neutral-700 dark:text-neutral-300 text-base">
                        {mode === "station" ? "Download Report by Station" : "Download Report by Job"}
                    </p>


                    {isReportReady && (
                        <p className="relative z-20 font-sans font-normal text-neutral-400 dark:text-neutral-400 text-base mt-2">
                            Your report is available for downloading
                        </p>
                    )}

                    {/* Animated Button for Station report download */}
                    <motion.div
                        whileHover={{ x: 10, y: -10, scale: 1.05, borderStyle: "solid" }}
                        transition={{ type: "spring", stiffness: 120, damping: 10 }}
                    >
                        <button
                            className={`mt-4 px-6 py-2 rounded-lg border-2 border-dotted ${isReportReady
                                ? "bg-green-500 text-white hover:bg-green-600 border-green-500"
                                : "bg-gray-400 text-gray-700 cursor-not-allowed border-gray-400"
                                }`}
                            onClick={onDownload}
                            disabled={!isReportReady} // Disable button if report is not ready
                        >
                            <IconDownload className="inline-block mr-2" />
                            Download
                        </button>
                    </motion.div>




                    {/* Display Selected Details */}
                    {isReportReady && selectedValueRef && (
                        <div className="mt-4">
                            {mode === "station" && (
                                <>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Station: {selectedValueRef.selectedMachineType}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Shift: {selectedValueRef.selectedShift}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Date: {selectedValueRef.selectedStartDate}
                                    </p>
                                    {selectedValueRef.selectedEndDate && (
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            End Date: {selectedValueRef.selectedEndDate}
                                        </p>
                                    )}
                                </>
                            )}

                            {mode === "job" && (
                                <>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Job Name: {selectedValueRef.selectedJobName}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Job Serial: {selectedValueRef.selectedJobSerial}
                                    </p>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export function GridPattern() {
    const columns = 41;
    const rows = 11;
    return (
        <div className="flex bg-gray-100 dark:bg-neutral-900 shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px scale-105">
            {Array.from({ length: rows }).map((_, row) =>
                Array.from({ length: columns }).map((_, col) => {
                    const index = row * columns + col;
                    return (
                        <div
                            key={`${col}-${row}`}
                            className={`w-10 h-10 flex shrink-0 rounded-[2px] ${index % 2 === 0
                                ? "bg-gray-50 dark:bg-neutral-950"
                                : "bg-gray-50 dark:bg-neutral-950 shadow-[0px_0px_1px_3px_rgba(255,255,255,1)_inset] dark:shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]"
                                }`}
                        />
                    );
                })
            )}
        </div>
    );
}

import { z } from "zod";
import { AlertsResponse } from "../../interfaces/weatherInterfaces.js";
import { formatAlert, makeNWSRequest } from '../../helpers/getWeatherAPICall.js';

const NWS_API_BASE = "https://api.weather.gov";

export const getAlertsTool = {
    name: "get_alerts",
    description: "Get weather alerts for a state",
    inputSchema: {
        state: z.string().length(2).describe("Two-letter state code (e.g. CA, NY)"),
    },
    async execute({ state }: { state: string }) {
        const stateCode = state.toUpperCase();
        const alertsUrl = `${NWS_API_BASE}/alerts?area=${stateCode}`;
        const alertsData = await makeNWSRequest<AlertsResponse>(alertsUrl);

        if (!alertsData) {
            return {
                content: [
                    {
                        type: "text",
                        text: "Failed to retrieve alerts data",
                    },
                ],
            };
        }

        const features = alertsData.features || [];
        if (features.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: `No active alerts for ${stateCode}`,
                    },
                ],
            };
        }

        const formattedAlerts = features.map(formatAlert);
        const alertsText = `Active alerts for ${stateCode}:\n\n${formattedAlerts.join("\n")}`;

        return {
            content: [
                {
                    type: "text",
                    text: alertsText,
                },
            ],
        };
    },
};

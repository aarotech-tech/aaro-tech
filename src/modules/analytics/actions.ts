import { internalActionClient } from "@/lib/safe-action";
import { analyticsService } from "./services";
import * as z from "zod";

export const getRevenueStatsAction = internalActionClient
  .action(async () => {
    const stats = await analyticsService.getRevenueStats();
    return { success: true, stats };
  });

export const getSalesFunnelAction = internalActionClient
  .action(async () => {
    const funnel = await analyticsService.getSalesFunnel();
    return { success: true, funnel };
  });

export const getPipelineForecastAction = internalActionClient
  .action(async () => {
    const forecast = await analyticsService.getPipelineForecast();
    return { success: true, forecast };
  });

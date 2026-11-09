import { Request, Response } from 'express';
import { reportService } from '../services/report.service';
import { sendSuccess, sendError } from '../utils/response';

export class ReportController {
  async getDashboard(req: Request, res: Response) {
    try {
      const data = await reportService.getDashboardMetrics();
      return sendSuccess(res, data);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  async getDaily(req: Request, res: Response) {
    try {
      const { start_date, end_date } = req.query;
      const data = await reportService.getDailySalesReport(start_date as string, end_date as string);
      return sendSuccess(res, data);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  async getFoodWise(req: Request, res: Response) {
    try {
      const data = await reportService.getFoodWiseSales();
      return sendSuccess(res, data);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  async exportCsv(req: Request, res: Response) {
    try {
      const { start_date, end_date } = req.query;
      const csv = await reportService.generateOrdersCsv(start_date as string, end_date as string);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=home_kitchen_orders_${Date.now()}.csv`);
      return res.status(200).send(csv);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }
}

export const reportController = new ReportController();

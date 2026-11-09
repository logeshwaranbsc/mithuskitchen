import { Router } from 'express';
import authRoutes from './auth.routes';
import foodRoutes from './food.routes';
import menuRoutes from './menu.routes';
import orderRoutes from './order.routes';
import subscriptionRoutes from './subscription.routes';
import profileRoutes from './profile.routes';
import reportRoutes from './report.routes';
import settingsRoutes from './settings.routes';
import webhookRoutes from './webhook.routes';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/foods', foodRoutes);
apiRouter.use('/menus', menuRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/subscriptions', subscriptionRoutes);
apiRouter.use('/customer/profile', profileRoutes);
apiRouter.use('/reports', reportRoutes);
apiRouter.use('/settings', settingsRoutes);
apiRouter.use('/webhooks', webhookRoutes);

// Root health check
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'HOME KITCHEN API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

export default apiRouter;


-- Uploads table to track CSV uploads
CREATE TABLE public.uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  row_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own uploads" ON public.uploads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own uploads" ON public.uploads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own uploads" ON public.uploads FOR DELETE USING (auth.uid() = user_id);

-- Sales data from CSVs
CREATE TABLE public.sales_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  upload_id UUID NOT NULL REFERENCES public.uploads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  sale_date DATE NOT NULL,
  quantity_sold INTEGER NOT NULL DEFAULT 0,
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  current_stock INTEGER NOT NULL DEFAULT 0,
  reorder_point INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sales_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sales data" ON public.sales_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sales data" ON public.sales_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own sales data" ON public.sales_data FOR DELETE USING (auth.uid() = user_id);

-- AI insights generated per product
CREATE TABLE public.ai_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  upload_id UUID NOT NULL REFERENCES public.uploads(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'healthy',
  risk_level TEXT NOT NULL DEFAULT 'low',
  recommendation TEXT,
  explanation TEXT,
  recommended_order_qty INTEGER,
  forecast_next_30 JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insights" ON public.ai_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own insights" ON public.ai_insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own insights" ON public.ai_insights FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_sales_data_upload ON public.sales_data(upload_id);
CREATE INDEX idx_sales_data_user ON public.sales_data(user_id);
CREATE INDEX idx_sales_data_product ON public.sales_data(product_name);
CREATE INDEX idx_ai_insights_upload ON public.ai_insights(upload_id);
CREATE INDEX idx_ai_insights_user ON public.ai_insights(user_id);

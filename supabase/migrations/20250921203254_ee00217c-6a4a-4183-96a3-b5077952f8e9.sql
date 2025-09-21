-- Create alarms table
CREATE TABLE public.alarms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT,
  time TEXT NOT NULL,
  pushups INTEGER NOT NULL DEFAULT 5,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.alarms ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own alarms" 
ON public.alarms 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own alarms" 
ON public.alarms 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alarms" 
ON public.alarms 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alarms" 
ON public.alarms 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_alarms_updated_at
BEFORE UPDATE ON public.alarms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
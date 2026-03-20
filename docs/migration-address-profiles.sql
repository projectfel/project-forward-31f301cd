-- Migration: Add address field to profiles table
-- Run this in the Supabase SQL Editor

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address text;

-- Also add a categories table for store-specific product categories if not exists
-- (the global categories table already exists, we'll use it)

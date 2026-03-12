ALTER TABLE profiles
  ALTER COLUMN preferences TYPE TEXT USING preferences::text;
# Deployment Environment Values

Last updated: 2026-07-04

Use these values for the HBOOK deployment target.

## Non-Secret Values

These can be configured directly in the hosting platform.

```env
NEXT_PUBLIC_SUPABASE_URL="https://mottluzusodnjmfjchuq.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_00xc9NVtHo1lqGYqosoW9Q_e09bG3nx"
SUPABASE_STORAGE_BUCKET_VEHICLES="vehicle-photos"
SUPABASE_STORAGE_BUCKET_DRIVERS="driver-photos"
SUPABASE_STORAGE_BUCKET_ROOMS="room-assets"
```

Set `APP_URL` to the final deployed app URL after the deployment target and domain are confirmed.

## Secret Values

Owner must configure these securely in the deployment platform. Do not commit them.

```env
DATABASE_URL="postgresql://..."
SUPABASE_SECRET_KEY="..."
```

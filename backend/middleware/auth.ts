import { Request, Response, NextFunction } from "express";
import { supabase } from "../supabaseClient";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  // 1. Header prüfen: "Authorization: Bearer <TOKEN>"
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Missing authorization header" });
  }

  // 2. Token extrahieren (alles nach "Bearer ")
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Invalid token format" });
  }

  // 3. Supabase fragen: "Ist dieser Token gültig?"
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    console.error("Auth Error:", error?.message);
    return res.status(403).json({ error: "Unauthorized / Invalid Token" });
  }

  // 4. Alles gut? Weiter geht's!
  // Wir können den User sogar an den Request hängen für spätere Nutzung
  (req as any).user = user;
  
  next();
}
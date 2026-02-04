import crypto from "crypto";

export default function createRefreshToken() {
  return crypto.randomBytes(40).toString("hex");
}

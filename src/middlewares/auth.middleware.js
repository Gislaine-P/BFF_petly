import { CognitoJwtVerifier } from "aws-jwt-verify";

// Configuración del verificador con las salidas de tu Terraform
const verifier = CognitoJwtVerifier.create({
  userPoolId: "us-east-1_tMEJHUj2k",
  tokenUse: "access",
  clientId: "36jut84jjk5bge3h0m6ek15te0",
});

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Acceso denegado: Token no proporcionado" });
    }

    const token = authHeader.split(" ")[1];

    const payload = await verifier.verify(token);

    req.user = payload;

    next();
  } catch (err) {
    return res.status(403).json({ message: "Token inválido o expirado", error: err.message });
  }
};
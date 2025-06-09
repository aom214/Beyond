import jwt from "jsonwebtoken";
import { generate_jwt_token } from "../Controller/User.controller.js";
import { User } from "../Models/User.models.js";

const getUser = async (req, res, next) => {
    try {
        console.log("🚀 Checking user authentication...");
        const accessToken_new = req.cookies?.accessToken;
        const refreshToken_new = req.cookies?.refreshToken;
        console.log(`🔑 Tokens received: AccessToken: ${accessToken_new} | RefreshToken: ${refreshToken_new}`);

        // ✅ If Access Token exists, verify it
        if (accessToken_new) {
            try {
                const decode = jwt.verify(accessToken_new, process.env.ACCESS_TOKEN_SECRET);
                const new_user = await User.findById(decode.id);
                if (!new_user) return next();
                
                req.user = new_user;
                console.log("✅ Access Token Verified");
                return next();
            } catch (err) {
                console.log("❌ Access Token Invalid/Expired");
            }
        }

        // ✅ If Refresh Token exists, generate new tokens
        if (refreshToken_new) {
            try {
                const decode = jwt.verify(refreshToken_new, process.env.REFRESH_TOKEN_SECRET);
                console.log("🔄 Refresh Token Valid, Generating New Tokens...");
                
                const { access_token, refresh_token } = await generate_jwt_token(decode.id);
                if (!access_token || !refresh_token) return next();

                const new_user = await User.findById(decode.id);
                if (!new_user) return next();

                // ✅ Save new tokens in DB
                new_user.accessToken = access_token;
                new_user.refreshToken = refresh_token;
                new_user.validateBeforeSave = false;
                await new_user.save();

                console.log("✅ New tokens generated & saved.");

                // ✅ Set new Secure Cookies
                res.cookie("accessToken", access_token, {
                    httpOnly: true,
                    secure: true, // Required for `SameSite: None`
                    sameSite: "None", // ✅ Allow cross-origin requests
                    maxAge: 15 * 60 * 1000, // 15 minutes
                });

                res.cookie("refreshToken", refresh_token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "None",
                    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                });

                req.user = new_user;
                return next();
            } catch (err) {
                console.log("❌ Refresh Token Invalid/Expired", err.message);
            }
        }

        return next();
    } catch (error) {
        console.error("🔥 Error in `getUser` middleware:", error);
        return next();
    }
};

export default getUser;

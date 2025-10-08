import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import cloudinaryUpload from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

async function generateAccessAndRefreshToken(userId) {
    const user = await User.findById(userId)
        .then((user) => {
            const accessToken = user.generateAccessToken();
            const refreshToken = user.generateRefreshToken();
            user.refreshToken = refreshToken;
            user.save({ validateBeforeSave: false });
            return { accessToken, refreshToken };
        })
        .catch((err) => {
            throw new ApiErrors(
                500,
                "something went wrong while generating access and refresh token"
            );
        });
}

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, password, email, username } = req.body;

    //checking if all fields are filled
    if (
        [fullName, password, email, username].some(
            (item) => item?.trim() === ""
        )
    ) {
        throw new ApiErrors(400, "All fields are required");
    }

    //checking if user already exists
    const existedUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existedUser) throw new ApiErrors(409, "User already exists");

    //getting path of avatar and coverImage
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage[0].length > 0
    ) {
        coverImageLocalPath = req.files?.coverImage[0]?.path;
    }

    //checking if avatar is provided by user
    if (!avatarLocalPath) throw new ApiErrors(400, "Avatar is required");

    //uploading avatar and coverImage to cloudinary
    const avatar = await cloudinaryUpload(avatarLocalPath);
    const coverImage = await cloudinaryUpload(coverImageLocalPath);

    if (!avatar)
        throw new ApiErrors(
            500,
            "Avatar file is required,error uploading to cloudinary"
        );

    const user = await User.create({
        fullName: fullName,
        email: email,
        username: username.toLowerCase(),
        password: password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiErrors(
            500,
            "Something went wrong while registering the user"
        );
    }

    return res
        .status(201)
        .json(
            new ApiResponse(201, createdUser, "User registered successfully")
        );
});

const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!(username || email))
        throw new ApiErrors(400, "Username or Email is required");

    const user = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (!user) throw new ApiErrors(404, "User not found");

    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) throw new ApiErrors(401, "Password is not valid");

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
    );

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "user logged in successfully"
            )
        );


        
});






export { registerUser, loginUser };

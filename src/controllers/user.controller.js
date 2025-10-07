import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import cloudinaryUpload from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    const { fullname, password, email, username } = req.body;

    //checking if all fields are filled
    if (
        [fullname, password, email, username].some(
            (item) => item?.trim() === ""
        )
    ) {
        throw new ApiErrors(400, "All fields are required");
    }

    //checking if user already exists
    const existedUser = await User.findOne({ $or: [email, username] });
    if (existedUser) throw new ApiErrors(409, "User already exists");

    //getting path of avatar and coverImage
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

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
        fullname: fullname,
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

export { registerUser };

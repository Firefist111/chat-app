import React, { useState, useContext } from 'react';
import assets from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../../context/Authcontext";

const ProfilePage = () => {
  const { authUser, updateProfile } = useContext(AuthContext);
  const [img, setImg] = useState(null);
  const navigate = useNavigate();

  const [fullname, setFullname] = useState(authUser?.fullname || "");
  const [bio, setBio] = useState(authUser?.bio || "");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 🟣 If no new image, just update text fields
      if (!img) {
        await updateProfile({ fullname, bio });
        navigate('/');
        return;
      }

      // 🟣 If new image selected, convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(img);
      reader.onloadend = async () => {
        const base64data = reader.result;
        await updateProfile({ profilePic: base64data, fullname, bio });
        navigate('/');
      };
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className='min-h-screen bg-cover bg-no-repeat flex items-center justify-center'>
      <div className='max-w-2xl w-5/6 backdrop-blur-2xl border-2 border-gray-700 flex items-center justify-between max-sm:flex-col-reverse rounded-2xl'>
        
        {/* LEFT SIDE - FORM */}
        <form className='flex flex-col gap-5 px-8 py-13 w-[50%]' onSubmit={handleSubmit}>
          <h3 className='text-xl'>Profile Details</h3>

          {/* Image Upload */}
          <label htmlFor="avatar" className='flex items-center gap-3 cursor-pointer'>
            <input
              type="file"
              id='avatar'
              accept='image/*'
              onChange={(e) => setImg(e.target.files[0])}
              hidden
            />
            {img || authUser?.profilePic || assets.avatar_icon ? (
              <img
                src={
                  img
                    ? URL.createObjectURL(img)
                    : authUser?.profilePic || assets.avatar_icon
                }
                alt="avatar"
                className='w-12 h-12 rounded-full object-cover'
              />
            ) : null}
            Upload Image
          </label>

          {/* Full Name */}
          <input
            type="text"
            required
            placeholder='Your Full Name'
            className='border-gray-500 rounded-lg px-3 py-3 border-2 focus:outline-none focus:ring-2 focus:ring-violet-500'
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
          />

          {/* Bio */}
          <textarea
            required
            placeholder='Enter bio'
            rows={4}
            className='border-gray-500 rounded-lg px-3 py-3 border-2 focus:outline-none focus:ring-2 focus:ring-violet-500'
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

          {/* Submit Button */}
          <button
            type='submit'
            className='bg-purple-600 px-5 py-2.5 border-0 rounded-3xl w-fit text-center m-auto hover:bg-purple-700 transition'
          >
            Save
          </button>
        </form>

        {/* RIGHT SIDE - PREVIEW IMAGE */}
        {(img || authUser?.profilePic || assets.avatar_icon) && (
          <img
            src={
              img
                ? URL.createObjectURL(img)
                : authUser?.profilePic || assets.avatar_icon
            }
            alt="Profile Preview"
            className='max-w-44 aspect-square mx-10 max-sm:mt-10 rounded-full object-cover'
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;

import React, { useState, useContext } from 'react';
import assets from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../../context/Authcontext";

const ProfilePage = () => {
  const { authUser, updateProfile } = useContext(AuthContext);
  const [img, setImg] = useState(null);
  const navigate = useNavigate();

  const [fullName, setFullname] = useState(authUser?.fullname || "");
  const [bio, setBio] = useState(authUser?.bio || "");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🟣 If no new image, just update text fields
    if (!img) {
      await updateProfile({ fullName, bio });
      navigate('/');
      return;
    }

    // 🟣 If new image selected, convert to base64
    const render = new FileReader();
    render.readAsDataURL(img);
    render.onloadend = async () => {
      const base64data = render.result;
      await updateProfile({ profilePic: base64data, fullName, bio });
      navigate('/');
    };
  };

  return (
    <div className='min-h-screen bg-cover bg-no-repeat flex items-center justify-center'>
      <div className='max-w-2xl w-5/6 backdrop-blur-2xl border-2 border-gray-700 flex items-center justify-between max-sm:flex-col-reverse rounded-2xl'>
        <form className='flex flex-col gap-5 px-8 py-13 w-[50%]' onSubmit={handleSubmit}>
          <h3 className='text-xl'>Profile Details</h3>

          <label htmlFor="avatar" className='flex items-center gap-3 cursor-pointer'>
            <input
              type="file"
              id='avatar'
              onChange={(e) => setImg(e.target.files[0])}
              hidden
            />
            <img
              src={img ? URL.createObjectURL(img) : authUser?.profilePic || assets.avatar_icon}
              alt="avatar"
              className='h-12 w-12 rounded-full'
            />
            Upload Image
          </label>

          <input
            type="text"
            required
            placeholder='Your Full Name'
            className='border-gray-500 rounded-lg px-3 py-3 border-2 focus:outline-none focus:right-2 focus:ring-violet-500'
            value={fullName}
            onChange={(e) => setFullname(e.target.value)}
          />

          <textarea
            required
            placeholder='Enter bio'
            rows={4}
            className='border-gray-500 rounded-lg px-3 py-3 border-2'
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

          <button
            type='submit'
            className='bg-purple-600 px-5 py-2.5 border-0 rounded-3xl w-fit text-center m-auto'
          >
            Save
          </button>
        </form>

        <img src={assets.logo_icon} alt="" className='max-w-44 aspect-square mx-10 max-sm:mt-10' />
      </div>
    </div>
  );
};

export default ProfilePage;

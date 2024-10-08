import React, { useEffect, useState, useRef } from 'react';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserStart,
} from '../redux/user/userSlice';
import { useSelector, useDispatch } from 'react-redux';
import { app } from '../firebase';
import { Link } from 'react-router-dom';

const Profile = () => {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  console.log('User:', currentUser);

  const [file, setFile] = useState(undefined);
  const [filePer, setFilePer] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({
    userName: currentUser.userName,
    email: currentUser.email,
    avatar: currentUser.avatar,
    password: currentUser.password,
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showList,setShowList]=useState(true);
  const [showListingErrors, setShowListingErrors] = useState(false);
  const [userListing, setUserListing] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        setFilePer(Math.round(progress));
      },
      (error) => {
        console.error('File upload error:', error); 
        setFileUploadError(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
          setFormData((prevData) => ({ ...prevData, avatar: downloadURL }))
        );
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (err) {
      dispatch(updateUserFailure(err.message));
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch('/api/auth/signout');
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(data.message));
    }
  };
  const handleShowListings = async () => {
    try {
      setShowList(false);
      setShowListingErrors(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      const data = await res.json();
      if (data.success === false) {
        setShowListingErrors(true);
        setShowList(true);
        return;
      }
      setUserListing(data);
      setShowList(false);

    } catch (error) {
      setShowListingErrors(true);
    }
  }
  const handleDeleteListing = async (listingId) => {
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success == false) {
        return;
      }
      setUserListing((prev) => prev.filter((listing) => listing._id !== listingId));
    } catch (error) {

    }
  }
  return (
    <div className='p-3 pt-32 max-w-lg mx-auto'>
      <h1 className='text-3xl font-bold text-center my-7'>Profile</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input
          onChange={(e) => setFile(e.target.files[0])}
          type='file'
          ref={fileRef}
          hidden
          accept='image/*'
        />
        <img
          onClick={() => fileRef.current.click()}
          className='rounded-full self-center h-24 w-24'
          src={formData.avatar || currentUser.avatar}
          alt='profile'
        />
        <p>
          {fileUploadError ? (
            <span className='text-red-700'>
              Error Image upload (image must be less than 2 mb)
            </span>
          ) : filePer > 0 && filePer < 100 ? (
            <span className='text-slate-700'>{`Uploading ${filePer}%`}</span>
          ) : filePer === 100 ? (
            <span className='text-green-700'>Image successfully uploaded!</span>
          ) : (
            ''
          )}
        </p>
        <input
          className='border p-3 rounded-lg'
          type='text'
          placeholder='userName'
          id='userName'
          value={formData.userName}
          onChange={handleChange}
        />
        <input
          className='border p-3 rounded-lg'
          type='email'
          placeholder='email'
          id='email'
          value={formData.email}
          onChange={handleChange}
        />
        <input
          className='border p-3 rounded-lg'
          type='password'
          placeholder='password'
          id='password'
          value={formData.password}
          onChange={handleChange}
        />
        <button
          disabled={loading}
          className='border p-3 text-white uppercase rounded-lg bg-slate-700 hover:opacity-85'
        >
          {loading ? 'Loading...' : 'UPDATE'}
        </button>
        <Link
          className='p-3 rounded-lg bg-green-600 uppercase text-center font-bold text-white'
          to={'/create-listing'}
        >
          Create Listing
        </Link>
      </form>
      <div className='flex justify-between mt-5'>
        <span onClick={handleDeleteUser} className='text-red-700 cursor-pointer'>
          Delete Account
        </span>
        <span onClick={handleSignOut} className='text-red-700 cursor-pointer'>
          Sign Out
        </span>
      </div>
      <p className='text-red-700 mt-5'>{error || ''}</p>
      <p className='text-green-700 mt-5'>
        {updateSuccess ? 'User is updated successfully!' : ''}
      </p>
      {showList && (
        <button onClick={handleShowListings} className='w-full text-green-600'>Show Listings</button>
      )}
      <p>{showListingErrors ? 'Some error occured' : ''}</p>
      {userListing && userListing.length > 0 &&
        <div className='flex flex-col gap-4'>
          <h1 className='text-center mt-7 text-2xl font-bold'>Your Listings</h1>
          {userListing.map((listing) => (
            <div key={listing._id} className='border rounded-lg p-3 flex justify-between items-center gap-4'>
              <Link to={`/listing/${listing._id}`}>
                <img src={listing.imageUrls[0]} alt='listing-cover' className='w-16 h-16 object-contain'></img></Link>
              <Link to={`/listing/${listing._id}`} className='text-slate-600 font-semibold flex-1 hover:underline truncate'><p>{listing.name}</p></Link>
              <div className='flex flex-row item-center gap-2'>
                <button onClick={() => handleDeleteListing(listing._id)} className='text-red-700 uppercase p-2 rounded-lg bg-pink-200 w-full'>Delete</button>
                <Link to={`/update-listing/${listing._id}`}><button className='text-green-700 uppercase p-2 rounded-lg bg-green-200 w-full'>Edit</button></Link>
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  );
};

export default Profile;



import React, { useEffect, useState } from "react";
import {
  getStorage,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

const UpdateListing = () => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const params = useParams();

  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: "",
    address: "",
    description: "",
    type: "rent",
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 0,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });

  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      const listingId = params.listingId;
      const res = await fetch(
        `https://heaven-hub-zn7r.vercel.app/api/listing/get/${listingId}`
      );
      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }
      setFormData(data);
    };
    fetchListing();
  }, [params.listingId]);

  const handleImageSubmit = (e) => {
    e.preventDefault();
    if (files.length > 0) {
      const promises = Array.from(files).map((file) => storeImage(file));
      setUploading(true);
      Promise.all(promises)
        .then((urls) => {
          setFormData((prev) => ({
            ...prev,
            imageUrls: prev.imageUrls.concat(urls),
          }));
          setImageUploadError(false);
          setUploading(false);
        })
        .catch((error) => {
          setImageUploadError("Image upload error");
          console.error("Error uploading images:", error);
          setUploading(false);
        });
    }
  };

  const storeImage = (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  const handleChange = (e) => {
    const { id, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [id]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.imageUrls.length < 1)
        return setError("You must upload at least one image");
      if (+formData.regularPrice < +formData.discountPrice)
        return setError("Discount price must be lower than regular price");

      setLoading(true);
      setError(false);
      const res = await fetch(
        `https://heaven-hub-zn7r.vercel.app/api/listing/update/${params.listingId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();
      setLoading(false);
      if (data.success === false) {
        setError(data.message);
      } else {
        navigate(`/listing/${data._id}`);
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <main className="p-6 mt-24 pt-32 max-w-6xl mx-auto bg-gray-100 rounded-lg shadow-lg">
      <h1 className="text-center font-bold text-4xl mb-6 text-blue-600">
        Update Listing
      </h1>
      {error && (
        <div className="bg-red-200 text-red-800 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-6">
        <div className="flex-1 flex flex-col gap-4 bg-gray-200 p-6 rounded-lg shadow-md">
          <input
            className="border rounded-lg p-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="text"
            placeholder="Property Name"
            id="name"
            required
            onChange={handleChange}
            value={formData.name}
          />
          <textarea
            className="border rounded-lg p-4 text-lg h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Description"
            id="description"
            required
            onChange={handleChange}
            value={formData.description}
          />
          <input
            className="border rounded-lg p-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="text"
            placeholder="Address"
            id="address"
            required
            onChange={handleChange}
            value={formData.address}
          />
          <div className="flex gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                className="w-5 text-blue-600"
                id="sale"
                name="type"
                onChange={handleChange}
                checked={formData.type === "sale"}
              />
              <label htmlFor="sale" className="text-lg">
                Sell
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="radio"
                className="w-5 text-blue-600"
                id="rent"
                name="type"
                onChange={handleChange}
                checked={formData.type === "rent"}
              />
              <label htmlFor="rent" className="text-lg">
                Rent
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-5 text-blue-600"
                id="parking"
                onChange={handleChange}
                checked={formData.parking}
              />
              <label htmlFor="parking" className="text-lg">
                Parking Spot
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-5 text-blue-600"
                id="furnished"
                onChange={handleChange}
                checked={formData.furnished}
              />
              <label htmlFor="furnished" className="text-lg">
                Furnished
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-5 text-blue-600"
                id="offer"
                onChange={handleChange}
                checked={formData.offer}
              />
              <label htmlFor="offer" className="text-lg">
                Offer
              </label>
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="p-4 border border-gray-300 rounded-lg text-lg w-24 focus:outline-none focus:ring-2 focus:ring-blue-400"
                id="bedrooms"
                required
                onChange={handleChange}
                value={formData.bedrooms}
              />
              <span className="text-lg">Bedrooms</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="p-4 border border-gray-300 rounded-lg text-lg w-24 focus:outline-none focus:ring-2 focus:ring-blue-400"
                id="bathrooms"
                required
                onChange={handleChange}
                value={formData.bathrooms}
              />
              <span className="text-lg">Bathrooms</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="p-4 border border-gray-300 rounded-lg text-lg w-24 focus:outline-none focus:ring-2 focus:ring-blue-400"
                id="regularPrice"
                required
                onChange={handleChange}
                value={formData.regularPrice}
              />
              <span className="text-lg">Regular Price</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="p-4 border border-gray-300 rounded-lg text-lg w-24 focus:outline-none focus:ring-2 focus:ring-blue-400"
                id="discountPrice"
                required
                onChange={handleChange}
                value={formData.discountPrice}
              />
              <span className="text-lg">Discount Price</span>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex flex-col gap-4 mb-4">
            <label className="text-lg font-semibold">Upload Images:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFiles(e.target.files)}
              multiple
              className="border rounded-lg p-2 text-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="button"
              onClick={handleImageSubmit}
              className="bg-blue-500 text-white rounded-lg p-2 mt-2 hover:bg-blue-600 transition duration-200"
            >
              {uploading ? "Uploading..." : "Upload Images"}
            </button>
            {imageUploadError && (
              <div className="text-red-600">{imageUploadError}</div>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            {formData.imageUrls.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Uploaded image ${index}`}
                  className="w-32 h-32 object-cover rounded-lg shadow-md"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition duration-200"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      </form>

      <button
        onClick={handleSubmit}
        className={`bg-green-500 text-white rounded-lg uppercase font-bold p-4 mt-6 w-full hover:bg-green-600 transition duration-200 ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={loading}
      >
        {loading ? "Updating..." : "Update Listing"}
      </button>
    </main>
  );
};

export default UpdateListing;

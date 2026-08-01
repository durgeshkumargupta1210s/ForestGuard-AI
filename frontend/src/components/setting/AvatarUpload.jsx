import { useRef, useState } from "react";

import api from "../../services/api";

import {
  Camera,
  Upload,
} from "lucide-react";

function AvatarUpload({

  user,

  onSuccess,

}) {

  const inputRef = useRef(null);

  const [preview, setPreview] = useState(

    user?.avatar || null

  );

  const [loading, setLoading] = useState(false);

  const handleSelect = () => {

    inputRef.current.click();

  };

  const handleFile = async (e) => {

    const file = e.target.files[0];

    if (!file) return;

    setPreview(

      URL.createObjectURL(file)

    );

    const formData = new FormData();

    formData.append(

      "avatar",

      file

    );

    try {

      setLoading(true);

      await api.post(

        "/users/avatar",

        formData,

        {

          headers: {

            "Content-Type":

              "multipart/form-data",

          },

        }

      );

      if (onSuccess) {

        onSuccess();

      }

      alert(

        "Avatar updated successfully."

      );

    }

    catch (error) {

      console.log(error);

      alert(

        "Failed to upload avatar."

      );

    }

    finally {

      setLoading(false);

    }

  };

  return (

    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">

      <h2 className="text-2xl font-bold mb-6">

        Profile Picture

      </h2>

      <div className="flex flex-col md:flex-row items-center gap-8">

        <div className="relative">

          {

            preview ? (

              <img

                src={preview}

                alt="Avatar"

                className="w-36 h-36 rounded-full object-cover border-4 border-green-500"

              />

            ) : (

              <div className="w-36 h-36 rounded-full bg-slate-800 flex items-center justify-center">

                <Camera size={40} />

              </div>

            )

          }

        </div>

        <div>

          <input

            ref={inputRef}

            type="file"

            accept="image/*"

            hidden

            onChange={handleFile}

          />

          <button

            onClick={handleSelect}

            disabled={loading}

            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl flex items-center gap-3"

          >

            <Upload size={18} />

            {

              loading

                ? "Uploading..."

                : "Upload Avatar"

            }

          </button>

          <p className="text-sm text-slate-400 mt-4">

            Supported formats:

            JPG, PNG, WEBP

          </p>

        </div>

      </div>

    </div>

  );

}

export default AvatarUpload;
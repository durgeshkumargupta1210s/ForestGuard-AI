import {
  Camera,
  User,
  Shield,
  Calendar,
} from "lucide-react";

function UserProfileCard({

  user,

}) {

  const initials =

    user?.name

      ?.split(" ")

      .map((word) => word[0])

      .join("")

      .toUpperCase() || "U";

  return (

    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-8">

      <div className="flex flex-col md:flex-row items-center gap-8">

        {/* Avatar */}

        <div className="relative">

          {

            user?.avatar ?

            (

              <img

                src={user.avatar}

                alt="Avatar"

                className="w-32 h-32 rounded-full object-cover border-4 border-green-500"

              />

            )

            :

            (

              <div className="w-32 h-32 rounded-full bg-green-600 flex items-center justify-center text-4xl font-bold">

                {initials}

              </div>

            )

          }

          <button

            className="absolute bottom-0 right-0 bg-green-600 hover:bg-green-700 p-3 rounded-full"

          >

            <Camera size={18} />

          </button>

        </div>

        {/* User Information */}

        <div className="flex-1">

          <h2 className="text-3xl font-bold">

            {user?.name}

          </h2>

          <p className="text-slate-400 mt-2">

            {user?.email}

          </p>

          <div className="flex flex-wrap gap-6 mt-6">

            <div className="flex items-center gap-2">

              <Shield

                className="text-green-500"

              />

              <span>

                {user?.role || "User"}

              </span>

            </div>

            <div className="flex items-center gap-2">

              <Calendar

                className="text-blue-400"

              />

              <span>

                Joined{" "}

                {

                  user?.createdAt

                  ?

                  new Date(

                    user.createdAt

                  ).toLocaleDateString()

                  :

                  "--"

                }

              </span>

            </div>

            <div className="flex items-center gap-2">

              <User

                className="text-yellow-400"

              />

              <span className="text-green-400">

                Online

              </span>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}

export default UserProfileCard;

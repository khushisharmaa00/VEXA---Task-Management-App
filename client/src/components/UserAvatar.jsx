import { Dialog, Menu, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { FaUser, FaUserEdit, FaUserLock } from "react-icons/fa";
import { IoLogOutOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getInitials } from "../utils";
import { logout } from "../redux/slices/authSlice";
import { useChangePasswordMutation } from "../redux/slices/apiSlice";
import Profile from "./Profile";
import ModalWrapper from "./ModalWrapper";
import { toast } from "sonner";

const UserAvatar = () => {
  const [open, setOpen] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [openPassword, setOpenPassword] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [changePassword] = useChangePasswordMutation();

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const logoutHandler = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    try {
      const response = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }).unwrap();

      toast.success("Password changed successfully");
      setOpenPassword(false);
      // Clear the form
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Password change error:", error);
      toast.error(error.data?.message || "Failed to change password");
    }
  };

  return (
    <>
      <div>
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button className="w-10 h-10 2xl:w-12 2xl:h-12 items-center justify-center rounded-full bg-blue-600 dark:bg-blue-700">
              <span className="text-white font-semibold">
                {getInitials(user?.name || "")}
              </span>
            </Menu.Button>
          </div>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 dark:divide-gray-700 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black/5 dark:ring-gray-600 focus:outline-none">
              <div className="p-2">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => setOpenProfile(true)}
                      className={`${
                        active ? "bg-gray-100 dark:bg-gray-500" : ""
                      } text-gray-900 dark:text-gray-100 group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    >
                      <FaUserEdit className="mr-2" aria-hidden="true" />
                      Profile
                    </button>
                  )}
                </Menu.Item>

                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => setOpenPassword(true)}
                      className={`${
                        active ? "bg-gray-100 dark:bg-gray-700" : ""
                      } text-gray-900 dark:text-gray-100 group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    >
                      <FaUserLock className="mr-2 h-5 w-5" aria-hidden="true" />
                      Change Password
                    </button>
                  )}
                </Menu.Item>

                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={logoutHandler}
                      className={`${
                        active ? "bg-gray-100 dark:bg-gray-700" : ""
                      } text-red-600 dark:text-red-400 group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    >
                      <IoLogOutOutline className="mr-2" aria-hidden="true" />
                      Logout
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
      {openProfile && (
        <ModalWrapper open={openProfile} setOpen={setOpenProfile}>
          <Profile
            user={user}
            onClose={() => setOpenProfile(false)}
            onUpdate={(updatedUser) => {
              dispatch(updateUserProfile(updatedUser));
              // Optionally update your Redux store or local state
              console.log("Profile updated:", updatedUser);
            }}
          />
        </ModalWrapper>
      )}

      {openPassword && (
        <ModalWrapper open={openPassword} setOpen={setOpenPassword}>
          <div className="space-y-6">
            <div>
              <Dialog.Title className="text-2xl font-bold text-gray-900 dark:text-white">
                Change Password
              </Dialog.Title>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Please enter your current and new password
              </p>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-colors duration-200"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Password:
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg 
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-colors duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm New Password:
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg 
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-colors duration-200"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-blue-600 text-white 
            hover:bg-blue-700 transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </ModalWrapper>
      )}
    </>
  );
};

export default UserAvatar;

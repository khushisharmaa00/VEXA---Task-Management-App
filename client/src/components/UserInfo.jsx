import { Popover, Transition } from "@headlessui/react";
import React, { Fragment, useState } from "react";
import { getInitials } from "../utils";

const UserInfo = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  if (!user || !user.name) return null;

  return (
    <div className="">
      <Popover
        className="relative group"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {/* {({ open }) => ( */}
        <>
          <Popover.Button as={Fragment}>
            <div className="w-7 h-7 rounded-full text-white flex items-center justify-center text-sm cursor-pointer">
              <span className="text-xs">{getInitials(user.name)}</span>
            </div>
          </Popover.Button>

          <Transition
            show={isOpen}
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute left-1/2 z-10 mt-3 w-80 max-w-sm -translate-x-1/2 transform px-4 sm:px-0 ">
              <div className="flex items-center gap-4 rounded-lg shadow-lg bg-white p-8">
                <div className="w-16 h-16 bg-blue-600 rounded-full text-white flex items-center justify-center text-2xl ">
                  <span className="text-center font-bold">
                    {getInitials(user.name)}
                  </span>
                </div>
                <div className="flex flex-col gap-y-1">
                  <p className="text-black text-xl font-bold">{user.name}</p>
                  {user.title && (
                    <span className="text-xs text-gray-500">{user.title}</span>
                  )}
                  {user.email && (
                    <span className="text-blue-500 text-xs">{user.email}</span>
                  )}
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
        {/* )} */}
      </Popover>
    </div>
  );
};

export default UserInfo;

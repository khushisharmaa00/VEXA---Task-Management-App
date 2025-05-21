import { Dialog } from "@headlessui/react";
import clsx from "clsx";
import { FaQuestion } from "react-icons/fa";
import ModalWrapper from "./ModalWrapper";
import Button from "./Button";

export default function ConfirmatioDialog({
  open,
  setOpen,
  msg,
  setMsg = () => {},
  onClick = () => {},
  type = "delete",
  setType = () => {},
}) {
  const closeDialog = () => {
    setType("delete");
    setMsg(null);
    setOpen(false);
  };

  return (
    <>
      <ModalWrapper open={open} setOpen={closeDialog}>
        <div className="py-4 w-full flex flex-col gap-4 items-center justify-center dark:bg-gray-800 rounded-lg">
          <Dialog.Title as="h3" className="">
            <p
              className={clsx(
                "p-3 rounded-full ",
                type === "restore" || type === "restoreAll"
                  ? "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200"
                  : "text-red-600 bg-red-200 dark:bg-red-900 dark:text-red-200"
              )}
            >
              <FaQuestion size={60} />
            </p>
          </Dialog.Title>

          <p className="text-center text-gray-500 dark:text-gray-300">
            {msg ?? "Are you sure you want to delete the selected record?"}
          </p>

          <div className="bg-gray-50 dark:bg-gray-700 py-3 sm:flex sm:flex-row-reverse gap-4 rounded-lg">
            <Button
              type="button"
              className={clsx(
                " px-8 text-sm font-semibold text-white sm:w-auto",
                type === "restore" || type === "restoreAll"
                  ? "bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800"
                  : "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
              )}
              onClick={onClick}
              label={type === "restore" ? "Restore" : "Delete"}
            />

            <Button
              type="button"
              className="bg-white dark:bg-gray-600 dark:text-white px-8 text-sm font-semibold text-gray-900 sm:w-auto border"
              onClick={() => closeDialog()}
              label="Cancel"
            />
          </div>
        </div>
      </ModalWrapper>
    </>
  );
}

export function UserAction({ open, setOpen, onClick = () => {} }) {
  const closeDialog = () => {
    setOpen(false);
  };

  return (
    <>
      <ModalWrapper open={open} setOpen={closeDialog}>
        <div className="py-4 w-full flex flex-col gap-4 items-center justify-center dark:bg-gray-800 rounded-lg">
          <Dialog.Title as="h3" className="">
            <p
              className={clsx(
                "p-3 rounded-full",
                "text-red-600 bg-red-200 dark:bg-red-900 dark:text-red-200"
              )}
            >
              <FaQuestion size={60} />
            </p>
          </Dialog.Title>

          <p className="text-center text-gray-500 dark:text-gray-300">
            {"Are you sure you want to activate or deactive this account?"}
          </p>

          <div className="bg-gray-50 dark:bg-gray-700 py-3 sm:flex sm:flex-row-reverse gap-4 rounded-lg">
            <Button
              type="button"
              className={clsx(
                " px-8 text-sm font-semibold text-white sm:w-auto",
                "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
              )}
              onClick={onClick}
              label={"Yes"}
            />

            <Button
              type="button"
              className="bg-white dark:bg-gray-600 dark:text-white px-8 text-sm font-semibold text-gray-900 sm:w-auto border"
              onClick={() => closeDialog()}
              label="No"
            />
          </div>
        </div>
      </ModalWrapper>
    </>
  );
}

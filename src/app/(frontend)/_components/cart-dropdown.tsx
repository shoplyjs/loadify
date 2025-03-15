"use client";

import {
    Popover,
    PopoverButton,
    PopoverPanel,
    Transition,
} from "@headlessui/react";
import { Button } from "@medusajs/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";
import Thumbnail from "./thumbnail";
import { convertToLocale } from "../_util/money";
import DeleteButton from "./delete-button";
import LineItemPrice from "./line-item-price";
import { useCart } from "react-use-cart";
import LineItemOptions from "./line-item-options";

const CartDropdown = () => {
    const { cartTotal, items, totalItems } = useCart();
    const [activeTimer, setActiveTimer] = useState<NodeJS.Timer | undefined>(
        undefined
    );
    const [cartDropdownOpen, setCartDropdownOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const open = () => setCartDropdownOpen(true);
    const close = () => setCartDropdownOpen(false);

    const subtotal = cartTotal ?? 0;
    const itemRef = useRef<number>(totalItems || 0);

    const timedOpen = () => {
        open();

        const timer = setTimeout(close, 5000);

        setActiveTimer(timer);
    };

    const openAndCancel = () => {
        if (activeTimer) {
            clearTimeout(activeTimer as any);
        }

        open();
    };

    // Clean up the timer when the component unmounts
    useEffect(() => {
        return () => {
            if (activeTimer) {
                clearTimeout(activeTimer as any);
            }
        };
    }, [activeTimer]);

    const pathname = usePathname();

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        const currentItems = itemRef.current;
        itemRef.current = totalItems;

        if (
            totalItems > 0 &&
            currentItems !== totalItems &&
            !pathname.includes("/cart")
        ) {
            timedOpen();
        }
    }, [totalItems, pathname]);

    return (
        <div
            className="h-full z-50"
            onMouseEnter={openAndCancel}
            onMouseLeave={close}
        >
            <Popover className="relative h-full">
                <PopoverButton className="h-full">
                    <Link
                        className="hover:text-ui-fg-base"
                        href="/cart"
                        data-testid="nav-cart-link"
                    >
                        {isMounted ? `Cart (${totalItems})` : "Cart (0)"}
                    </Link>
                </PopoverButton>
                <Transition
                    show={cartDropdownOpen}
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                >
                    <PopoverPanel
                        static
                        className="hidden small:block absolute top-[calc(100%+1px)] right-0 bg-white border-x border-b border-gray-200 w-[420px] text-ui-fg-base"
                        data-testid="nav-cart-dropdown"
                    >
                        <div className="p-4 flex items-center justify-center">
                            <h3 className="text-large-semi">Cart</h3>
                        </div>
                        {items.length ? (
                            <>
                                <div className="overflow-y-scroll max-h-[402px] px-4 grid grid-cols-1 gap-y-8 no-scrollbar p-px">
                                    {items.map((item) => (
                                        <div
                                            className="grid grid-cols-[122px_1fr] gap-x-4"
                                            key={item.id}
                                            data-testid="cart-item"
                                        >
                                            <Link
                                                href={`/products/${item.handle}`}
                                                className="w-24"
                                            >
                                                <Thumbnail
                                                    thumbnail={item.imageUrl}
                                                    size="square"
                                                />
                                            </Link>
                                            <div className="flex flex-col justify-between flex-1">
                                                <div className="flex flex-col flex-1">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex flex-col overflow-ellipsis whitespace-nowrap mr-4 w-[180px]">
                                                            <h3 className="text-base-regular overflow-hidden text-ellipsis">
                                                                <Link
                                                                    href={`/products/${item.handle}`}
                                                                    data-testid="product-link"
                                                                >
                                                                    {
                                                                        item.productName
                                                                    }
                                                                </Link>
                                                            </h3>
                                                            <LineItemOptions
                                                                variant={{
                                                                    options:
                                                                        item.options,
                                                                    title: item.productName,
                                                                }}
                                                                data-testid="cart-item-variant"
                                                                data-value={
                                                                    item
                                                                }
                                                            />
                                                            <span
                                                                data-testid="cart-item-quantity"
                                                                data-value={
                                                                    item.quantity
                                                                }
                                                            >
                                                                Quantity:{" "}
                                                                {item.quantity}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-end">
                                                            <LineItemPrice
                                                                cartTotal={
                                                                    item.price
                                                                }
                                                                originalPrice={
                                                                    item.originalPrice
                                                                }
                                                                style="tight"
                                                                currencyCode={
                                                                    item.currency
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <DeleteButton
                                                    id={item.id}
                                                    className="mt-1"
                                                    data-testid="cart-item-remove-button"
                                                >
                                                    Remove
                                                </DeleteButton>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 flex flex-col gap-y-4 text-small-regular">
                                    <div className="flex items-center justify-between">
                                        <span className="text-ui-fg-base font-semibold">
                                            Subtotal{" "}
                                            <span className="font-normal">
                                                (excl. taxes)
                                            </span>
                                        </span>
                                        <span
                                            className="text-large-semi"
                                            data-testid="cart-subtotal"
                                            data-value={subtotal}
                                        >
                                            {convertToLocale({
                                                amount: subtotal,
                                                currency_code: items[0].currency,
                                            })}
                                        </span>
                                    </div>
                                    <Link href="/cart" passHref>
                                        <Button
                                            className="w-full"
                                            size="large"
                                            data-testid="go-to-cart-button"
                                        >
                                            Go to cart
                                        </Button>
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <div>
                                <div className="flex py-16 flex-col gap-y-4 items-center justify-center">
                                    <div className="bg-gray-900 text-small-regular flex items-center justify-center w-6 h-6 rounded-full text-white">
                                        <span>0</span>
                                    </div>
                                    <span>Your shopping bag is empty.</span>
                                    <div>
                                        <Link href="/store">
                                            <>
                                                <span className="sr-only">
                                                    Go to all products page
                                                </span>
                                                <Button onClick={close}>
                                                    Explore products
                                                </Button>
                                            </>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </PopoverPanel>
                </Transition>
            </Popover>
        </div>
    );
};

export default CartDropdown;

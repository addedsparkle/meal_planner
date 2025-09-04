import type { Ingredient } from "../types/Ingredient";
import { X } from "lucide-react";

export const ShoppingList = ({
  shoppingList,
  removeFromShoppingList,
}: {
  shoppingList: Map<string, Ingredient>;
  removeFromShoppingList: (id: string) => void;
}) => {
  return (
    <div>
      <h2>Shopping List</h2>

      <div>
        {shoppingList.size === 0 ? (
          <p>
            Your recipes don't have ingredients listed, or all items have been
            removed.
          </p>
        ) : (
          Array.from(shoppingList.values()).map((item) => (
            <div key={item.id}>
              <div>
                <div>
                  <p>{item.name}</p>
                  {item.count > 1 && <span>x{item.count}</span>}
                </div>
                <p>
                  For {[...new Set(item.recipes)].join(", ")}
                  {item.days.length > 1 &&
                    ` (${[...new Set(item.days)].join(", ")})`}
                </p>
              </div>
              <button
                onClick={() => {
                  removeFromShoppingList(item.name);
                }}
                title="Remove from shopping list"
              >
                <X />
              </button>
            </div>
          ))
        )}
      </div>

      {shoppingList.size > 0 && (
        <div>
          <p>{shoppingList.size} items to buy</p>
        </div>
      )}
    </div>
  );
};

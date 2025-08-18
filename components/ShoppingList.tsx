import { Ingredient } from "@/types/Ingredient";
import { X } from "lucide-react";

export default function ShoppingList ({shoppingList, removeFromShoppingList}:{shoppingList: Map<string, Ingredient>; removeFromShoppingList: (id:number) => void;}) {

  return <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Shopping List</h2>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {shoppingList.size === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Your recipes don't have ingredients listed, or all items have been removed.
                  </p>
                ) : (
                  shoppingList.values().map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-gray-800 capitalize">{item.name}</p>
                          {item.count > 1 && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                              x{item.count}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          For {[...new Set(item.recipes)].join(', ')} 
                          {item.days.length > 1 && ` (${[...new Set(item.days)].join(', ')})`}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromShoppingList(item.id)}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                        title="Remove from shopping list"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
              
              {shoppingList.size > 0 && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700 font-medium">
                    📝 {shoppingList.size} items to buy
                  </p>
                </div>
              )}
            </div>
          
}
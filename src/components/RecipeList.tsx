import { Cell, Column, ColumnResizer, ResizableTableContainer, Row, Table, TableBody, TableHeader } from "react-aria-components";
import type { Recipe } from "../types/Recipe";

export const RecipeList = ({
  recipes,
}: {
  recipes: Recipe[];
}) => {
  return recipes.length === 0 ? (
        <div>
        <p>
          No recipes added yet. Click the + button to add your first recipe!
        </p>
        </div>
      ) : (
        <ResizableTableContainer>
        <Table aria-label="Recipes" selectionMode="single">
           <TableHeader>
    <Column isRowHeader width={200}><span className="column-name text-lg">Name</span></Column>
    <Column><span className="column-name text-lg">Ingredients</span><ColumnResizer /></Column>
  </TableHeader>
  <TableBody>
        {recipes.map((recipe,index) => (
          <Row key={recipe.id} className={index%2 ? "bg-emerald-50" : "bg-white"}>
            <Cell className="font-semibold">{recipe.name}</Cell>
            <Cell>{recipe.ingredients.join(", ")}</Cell>
            </Row>
        ))}
      
  </TableBody>
</Table>
</ResizableTableContainer>
      )
    }

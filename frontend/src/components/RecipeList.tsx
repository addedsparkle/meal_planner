import {
  Cell,
  Column,
  ResizableTableContainer,
  Row,
  Table,
  TableBody,
  TableHeader,
} from "react-aria-components";

import { useRecipes } from "../hooks/useRecipes";

export const RecipeList = () => {
  const { data: loadedRecipes, isLoading, isError } = useRecipes();

  if (!isLoading && isError) {
    return (
      <div>
        <p>Error occurred when loading recipes</p>
      </div>
    );
  }

  if (isLoading) {
    <div>
      <p>Loading recipes</p>
    </div>;
  }

  if (!isLoading && loadedRecipes) {
    return loadedRecipes.length === 0 ? (
      <div>
        <p>
          No recipes added yet. Click the + button to add your first recipe!
        </p>
      </div>
    ) : (
      <ResizableTableContainer>
        <Table aria-label="Recipes" selectionMode="single">
          <TableHeader>
            <Column isRowHeader width={400}>
              <span className="column-name text-lg">Name</span>
            </Column>
            <Column isRowHeader>
              <span className="column-name text-lg">Main Protein</span>
            </Column>
            <Column isRowHeader>
              <span className="column-name text-lg">Meal</span>
            </Column>
           </TableHeader>
          <TableBody>
            {loadedRecipes.map((recipe, index) => (
              <Row
                key={recipe.id}
                className={index % 2 ? "bg-emerald-50" : "bg-white"}
              >
                <Cell className="font-semibold">{recipe.name}</Cell>
                <Cell className="font-semibold">{recipe.mainProtein}</Cell>
                <Cell className="font-semibold">{recipe.meal}</Cell>
              </Row>
            ))}
          </TableBody>
        </Table>
      </ResizableTableContainer>
    );
  }
};

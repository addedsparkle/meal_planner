export type Recipe = {
    id: string
    name: string
    description: string | null
    instructions: string | null
    prep_time: number | null
    cook_time: number | null
    servings: number | null
    created_at: string
};

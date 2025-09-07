import { createClient } from '@supabase/supabase-js'
import type { Handler, HandlerEvent, HandlerResponse } from '@netlify/functions'
import type { Database } from '../types/database.types'

const supabase = createClient(
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  process.env.SUPABASE_URL!,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Server-side key
)

export const handler: Handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
  const { httpMethod, body } = event

  try {
    switch (httpMethod) {
      case 'GET':
        {
          const { data, error } = await supabase
            .from('recipes')
            .select('*')
          
          return {
            statusCode: 200,
            body: JSON.stringify({ data, error })
          }
        }
      
      case 'POST':
        {
          try {
            const recipeData = JSON.parse(body || '{}') as Database['public']['Tables']['recipes']['Insert']
            const { data, error } = await supabase
              .from('recipes')
              .insert(recipeData)
              .select()
            
            return {
              statusCode: 200,
              body: JSON.stringify({ data, error })
            }
          } catch {
            return {
              statusCode: 400,
              body: JSON.stringify({ error: 'Invalid JSON in request body' })
            }
          }
        }
    }
    
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Not found' })
    }
  } catch {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error'})
    }
  }
}
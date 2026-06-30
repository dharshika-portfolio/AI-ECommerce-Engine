# MongoDB Atlas Vector Search Index Setup

## Index Name: `product_vector_index`

This index must be created manually in the MongoDB Atlas UI since it requires
the Atlas Search infrastructure which cannot be created programmatically via Mongoose.

### Steps to Create

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Navigate to your cluster → **Atlas Search** tab
3. Click **Create Search Index**
4. Choose **JSON Editor**
5. Select the `ecommerce.products` collection
6. Paste the following index definition:

```json
{
  "name": "product_vector_index",
  "type": "vectorSearch",
  "definition": {
    "fields": [
      {
        "type": "vector",
        "path": "embedding",
        "numDimensions": 1536,
        "similarity": "cosine"
      }
    ]
  }
}
```

6. Click **Create Search Index**
7. Wait for the index to build (usually takes 1-5 minutes depending on data size)

### Verification

After index creation, you should see `product_vector_index` listed under
the Atlas Search tab with status **Active**.

### Technical Details

| Property | Value |
|----------|-------|
| Index Name | `product_vector_index` |
| Collection | `products` |
| Field Path | `embedding` |
| Dimensions | 1536 (OpenAI text-embedding-3-small) |
| Similarity | cosine |
| numCandidates | 100 (at query time) |
| limit | 10 (at query time) |

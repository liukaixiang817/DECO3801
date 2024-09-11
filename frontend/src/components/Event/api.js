const baseURL = "https://data.brisbane.qld.gov.au/api/explore/v2.1/catalog/datasets/brisbane-city-council-events/records?limit=10";
const apiKey = "f0310fd20bd5ce96fc6cf14757ba1fe74fc110a278d74cc013e5dcce"; 

export const getAllPosts = async () => {
    try {
      const response = await fetch(baseURL, {
        method: 'GET',
        headers: {
          'Authorization': `Apikey ${apiKey}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const json = await response.json();
      console.log("Fetch successful");
  
      return json;
    } catch (error) {
      console.error('Error fetching posts', error);
      throw error;
    }
  };
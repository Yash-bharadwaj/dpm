import { ApolloLink, Observable } from '@apollo/client';
import { mockDevices, mockConfig, mockConfigVersions } from './mockData';

// This link intercepts GraphQL operations and returns mock data
export const mockLink = new ApolloLink((operation) => {
  return new Observable((observer) => {
    const operationName = operation.operationName;
    const query = operation.query.loc?.source.body || '';
    
    console.log(`Intercepted GraphQL operation: ${operationName}`);
    
    // Get device parameters
    const variables = operation.variables;
    
    // Simulate network delay
    setTimeout(() => {
      if (query.includes('getLcdeviceList')) {
        // Return mock devices
        observer.next({
          data: {
            getLcdeviceList: mockDevices
          }
        });
        observer.complete();
      } 
      else if (query.includes('getConfig')) {
        // Return mock config
        observer.next({
          data: {
            getConfig: mockConfig
          }
        });
        observer.complete();
      }
      else if (query.includes('getConfigValidVersion')) {
        // Return mock config versions
        observer.next({
          data: {
            getConfigValidVersion: mockConfigVersions
          }
        });
        observer.complete();
      }
      else if (query.includes('addLcDevice')) {
        // Simulate adding a device
        observer.next({
          data: {
            addLcDevice: {
              responsestatus: 'success',
              message: 'Device added successfully',
              __typename: 'ResponseStatus'
            }
          }
        });
        observer.complete();
      }
      else if (query.includes('deleteLcDevice')) {
        // Simulate deleting a device
        observer.next({
          data: {
            deleteLcDevice: {
              responsestatus: 'success',
              message: 'Device deleted successfully',
              __typename: 'ResponseStatus'
            }
          }
        });
        observer.complete();
      }
      else if (query.includes('saveConfig')) {
        // Simulate saving config
        observer.next({
          data: {
            saveConfig: {
              responsestatus: 'success',
              message: 'Configuration saved successfully',
              __typename: 'ResponseStatus'
            }
          }
        });
        observer.complete();
      }
      else if (query.includes('deployConfig')) {
        // Simulate deploying config
        observer.next({
          data: {
            deployConfig: {
              responsestatus: 'success',
              message: 'Configuration deployed successfully',
              __typename: 'ResponseStatus'
            }
          }
        });
        observer.complete();
      }
      else {
        // For any other query, return an error
        observer.error(new Error(`Unhandled query: ${operationName}`));
      }
    }, 500); // 500ms delay to simulate network
  });
});

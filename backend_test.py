import requests
import json
import sys
from datetime import datetime

class GraphQLAPITester:
    def __init__(self, base_url="https://discoverapi.blusapphire.com:447/dpm/graphql"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.token = None
        self.device_id = None
        self.org_code = "test_org"
        self.device_code = f"test_device_{datetime.now().strftime('%H%M%S')}"

    def run_test(self, name, query, variables=None, expected_status=200):
        """Run a single GraphQL API test"""
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = self.token
        
        payload = {
            "query": query,
            "variables": variables or {}
        }
        
        try:
            response = requests.post(self.base_url, json=payload, headers=headers)
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                return True, response.json()
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"Response: {response.text}")
                return False, {}
                
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_get_devices_list(self):
        """Test getting the list of devices"""
        query = """
        query getDevicesList($input: deviceinput!) {
            getLcdeviceList(input: $input) {
                deviceid
                orgcode
                devicecode
                devicetype
                devicename
                devicelocation
                deviceip
            }
        }
        """
        
        variables = {
            "input": {
                "orgcode": self.org_code
            }
        }
        
        success, response = self.run_test("Get Devices List", query, variables)
        if success and 'data' in response:
            print(f"Found {len(response['data'].get('getLcdeviceList', []))} devices")
            return True
        return False

    def test_add_device(self):
        """Test adding a new device"""
        query = """
        mutation addLcDevice($input: deviceinput!) {
            addLcDevice(input: $input) {
                responsestatus
                message
            }
        }
        """
        
        variables = {
            "input": {
                "orgcode": self.org_code,
                "devicecode": self.device_code,
                "devicetype": "collector",
                "devicename": "Test Device",
                "devicelocation": "Test Location",
                "deviceip": "192.168.1.1"
            }
        }
        
        success, response = self.run_test("Add Device", query, variables)
        if success and 'data' in response:
            status = response['data'].get('addLcDevice', {}).get('responsestatus')
            if status == "success":
                print(f"Successfully added device: {self.device_code}")
                return True
        return False

    def test_get_config(self):
        """Test getting device configuration"""
        query = """
        query getConfig($input: deviceinput!) {
            getConfig(input: $input) {
                responsestatus
                responsedata
                versionid
                configstatus
                configtags {
                    tagkey
                    tagvalue
                }
                comment
            }
        }
        """
        
        variables = {
            "input": {
                "orgcode": self.org_code,
                "devicecode": self.device_code
            }
        }
        
        success, response = self.run_test("Get Device Config", query, variables)
        if success and 'data' in response:
            status = response['data'].get('getConfig', {}).get('responsestatus')
            if status == "success":
                print(f"Successfully retrieved config for device: {self.device_code}")
                return True
        return False

    def test_save_config(self):
        """Test saving device configuration"""
        query = """
        mutation SaveConfig($input: deviceinput!) {
            saveConfig(input: $input) {
                responsestatus
                message
            }
        }
        """
        
        # Sample pipeline configuration
        pipeline_config = {
            "sources": [
                {
                    "id": "source1",
                    "type": "file",
                    "name": "Log File Source",
                    "config": {
                        "path": "/var/log/test.log"
                    }
                }
            ],
            "processors": [
                {
                    "id": "processor1",
                    "type": "regex",
                    "name": "Regex Parser",
                    "config": {
                        "pattern": ".*"
                    }
                }
            ],
            "destinations": [
                {
                    "id": "destination1",
                    "type": "s3",
                    "name": "S3 Destination",
                    "config": {
                        "bucket": "test-bucket"
                    }
                }
            ]
        }
        
        variables = {
            "input": {
                "orgcode": self.org_code,
                "devicecode": self.device_code,
                "configdata": json.dumps(pipeline_config),
                "comment": "Test configuration"
            }
        }
        
        success, response = self.run_test("Save Device Config", query, variables)
        if success and 'data' in response:
            status = response['data'].get('saveConfig', {}).get('responsestatus')
            if status == "success":
                print(f"Successfully saved config for device: {self.device_code}")
                return True
        return False

    def test_deploy_config(self):
        """Test deploying device configuration"""
        query = """
        mutation deployConfig($input: deviceinput!) {
            deployConfig(input: $input) {
                responsestatus
                message
            }
        }
        """
        
        variables = {
            "input": {
                "orgcode": self.org_code,
                "devicecode": self.device_code
            }
        }
        
        success, response = self.run_test("Deploy Device Config", query, variables)
        if success and 'data' in response:
            status = response['data'].get('deployConfig', {}).get('responsestatus')
            if status == "success":
                print(f"Successfully deployed config for device: {self.device_code}")
                return True
        return False

    def test_get_config_versions(self):
        """Test getting configuration versions"""
        query = """
        query getConfigValidVersion($input: deviceinput!) {
            getConfigValidVersion(input: $input) {
                lastmodified
                versionid
                status
                comment
            }
        }
        """
        
        variables = {
            "input": {
                "orgcode": self.org_code,
                "devicecode": self.device_code,
                "timezone": "UTC"
            }
        }
        
        success, response = self.run_test("Get Config Versions", query, variables)
        if success and 'data' in response:
            versions = response['data'].get('getConfigValidVersion', [])
            print(f"Found {len(versions)} configuration versions")
            return True
        return False

    def test_delete_device(self):
        """Test deleting a device"""
        query = """
        mutation deleteLcDevice($input: deviceinput!) {
            deleteLcDevice(input: $input) {
                responsestatus
                message
                __typename
            }
        }
        """
        
        variables = {
            "input": {
                "orgcode": self.org_code,
                "devicecode": self.device_code
            }
        }
        
        success, response = self.run_test("Delete Device", query, variables)
        if success and 'data' in response:
            status = response['data'].get('deleteLcDevice', {}).get('responsestatus')
            if status == "success":
                print(f"Successfully deleted device: {self.device_code}")
                return True
        return False

def main():
    # Setup
    tester = GraphQLAPITester()
    
    # Run tests
    tester.test_get_devices_list()
    
    if tester.test_add_device():
        tester.test_get_config()
        tester.test_save_config()
        tester.test_deploy_config()
        tester.test_get_config_versions()
        tester.test_delete_device()
    
    # Print results
    print(f"\n📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())
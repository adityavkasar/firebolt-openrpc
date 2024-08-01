#include "gtest/gtest.h"
#include "CoreSDKTest.h"
#include "JsonEngine.hpp"


class DeviceTest : public ::testing::Test {
	protected:
		JsonEngine* jsonEngine;

	void SetUp() override
	{
		jsonEngine = new JsonEngine();
	}

	void TearDown() override
	{
		delete jsonEngine;
	}
};


TEST_F(DeviceTest, TestDeviceId)
{
	Firebolt::Error error = Firebolt::Error::None;
	auto actual_value = jsonEngine->get_value("Device.id");

	auto value = Firebolt::IFireboltAccessor::Instance().DeviceInterface().id(&error);

	EXPECT_EQ(error, Firebolt::Error::None);
	EXPECT_EQ(value, REMOVE_QUOTES(actual_value));
}


TEST_F(DeviceTest, TestDeviceDistributor)
{
	Firebolt::Error error = Firebolt::Error::None;
	auto actual_value = jsonEngine->get_value("Device.distributor");

	auto value = Firebolt::IFireboltAccessor::Instance().DeviceInterface().distributor(&error);

	EXPECT_EQ(error, Firebolt::Error::None);
	EXPECT_EQ(value, REMOVE_QUOTES(actual_value));
}


TEST_F(DeviceTest, TestDevicePlatform)
{
	Firebolt::Error error = Firebolt::Error::None;
	auto actual_value = jsonEngine->get_value("Device.platform");

	auto value = Firebolt::IFireboltAccessor::Instance().DeviceInterface().platform(&error);

	EXPECT_EQ(error, Firebolt::Error::None);
	EXPECT_EQ(value, REMOVE_QUOTES(actual_value));
}


TEST_F(DeviceTest, TestDeviceUid)
{
	Firebolt::Error error = Firebolt::Error::None;
	auto actual_value = jsonEngine->get_value("Device.uid");

	auto value = Firebolt::IFireboltAccessor::Instance().DeviceInterface().uid(&error);

	EXPECT_EQ(error, Firebolt::Error::None);
	EXPECT_EQ(value, REMOVE_QUOTES(actual_value));
}


TEST_F(DeviceTest, TestDeviceType)
{
	Firebolt::Error error = Firebolt::Error::None;
	auto actual_value = jsonEngine->get_value("Device.type");

	auto value = Firebolt::IFireboltAccessor::Instance().DeviceInterface().type(&error);

	EXPECT_EQ(error, Firebolt::Error::None);
	EXPECT_EQ(value, REMOVE_QUOTES(actual_value));
}


TEST_F(DeviceTest, TestDeviceModel)
{
	Firebolt::Error error = Firebolt::Error::None;
	auto actual_value = jsonEngine->get_value("Device.model");

	auto value = Firebolt::IFireboltAccessor::Instance().DeviceInterface().model(&error);

	EXPECT_EQ(error, Firebolt::Error::None);
	EXPECT_EQ(value, REMOVE_QUOTES(actual_value));
}


TEST_F(DeviceTest, TestDeviceSku)
{
	Firebolt::Error error = Firebolt::Error::None;
	auto actual_value = jsonEngine->get_value("Device.sku");

	auto value = Firebolt::IFireboltAccessor::Instance().DeviceInterface().sku(&error);

	EXPECT_EQ(error, Firebolt::Error::None);
	EXPECT_EQ(value, REMOVE_QUOTES(actual_value));
}


TEST_F(DeviceTest, TestDeviceMake)
{
	Firebolt::Error error = Firebolt::Error::None;
	auto actual_value = jsonEngine->get_value("Device.make");

	auto value = Firebolt::IFireboltAccessor::Instance().DeviceInterface().make(&error);

	EXPECT_EQ(error, Firebolt::Error::None);
	EXPECT_EQ(value, REMOVE_QUOTES(actual_value));
}


// TEST_F(DeviceTest, TestDeviceversion)
// {
// 	Firebolt::Error error = Firebolt::Error::None;
// 	auto actual_value = jsonEngine->get_value("Device.version");
// 	actual_value = actual_value.substr(1, actual_value.length() - 2);
// 	auto value = Firebolt::IFireboltAccessor::Instance().DeviceInterface().version(&error);
// 	EXPECT_EQ(error, Firebolt::Error::None);
// 	EXPECT_EQ(value, actual_value);
// }


// TEST_F(DeviceTest, TestDevicehdcp)
// {
// 	Firebolt::Error error = Firebolt::Error::None;
// 	auto actual_value = jsonEngine->get_value("Device.hdcp");
// 	actual_value = actual_value.substr(1, actual_value.length() - 2);
// 	auto value = Firebolt::IFireboltAccessor::Instance().DeviceInterface().hdcp(&error);
// 	EXPECT_EQ(error, Firebolt::Error::None);
// 	EXPECT_EQ(value, actual_value);
// }


// TEST_F(DeviceTest, TestDevicehdr)
// {
// 	Firebolt::Error error = Firebolt::Error::None;
// 	auto actual_value = jsonEngine->get_value("Device.hdr");
// 	actual_value = actual_value.substr(1, actual_value.length() - 2);
// 	auto value = Firebolt::IFireboltAccessor::Instance().DeviceInterface().hdr(&error);
// 	EXPECT_EQ(error, Firebolt::Error::None);
// 	EXPECT_EQ(value, actual_value);
// }


// TEST_F(DeviceTest, TestDeviceaudio)
// {
// 	Firebolt::Error error = Firebolt::Error::None;
// 	auto actual_value = jsonEngine->get_value("Device.audio");
// 	actual_value = actual_value.substr(1, actual_value.length() - 2);
// 	auto value = Firebolt::IFireboltAccessor::Instance().DeviceInterface().audio(&error);
// 	EXPECT_EQ(error, Firebolt::Error::None);
// 	EXPECT_EQ(value, actual_value);
// }


// TEST_F(DeviceTest, TestDevicescreenResolution)
// {
// 	Firebolt::Error error = Firebolt::Error::None;
// 	auto actual_value = jsonEngine->get_value("Device.screenResolution");
// 	actual_value = actual_value.substr(1, actual_value.length() - 2);
// 	auto value = Firebolt::IFireboltAccessor::Instance().DeviceInterface().screenResolution(&error);
// 	EXPECT_EQ(error, Firebolt::Error::None);
// 	EXPECT_EQ(value, actual_value);
// }


// TEST_F(DeviceTest, TestDevicevideoResolution)
// {
// 	Firebolt::Error error = Firebolt::Error::None;
// 	auto actual_value = jsonEngine->get_value("Device.videoResolution");
// 	actual_value = actual_value.substr(1, actual_value.length() - 2);
// 	auto value = Firebolt::IFireboltAccessor::Instance().DeviceInterface().videoResolution(&error);
// 	EXPECT_EQ(error, Firebolt::Error::None);
// 	EXPECT_EQ(value, actual_value);
// }


TEST_F(DeviceTest, TestDeviceName)
{
	Firebolt::Error error = Firebolt::Error::None;
	auto actual_value = jsonEngine->get_value("Device.name");

	auto value = Firebolt::IFireboltAccessor::Instance().DeviceInterface().name(&error);

	EXPECT_EQ(error, Firebolt::Error::None);
	EXPECT_EQ(value, REMOVE_QUOTES(actual_value));
}


// TEST_F(DeviceTest, TestDeviceonDeviceNameChanged)
// {
// 	Firebolt::Error error = Firebolt::Error::None;
// 	auto actual_value = jsonEngine->get_value("Device.onDeviceNameChanged");
// 	actual_value = actual_value.substr(1, actual_value.length() - 2);
// 	auto value = Firebolt::IFireboltAccessor::Instance().DeviceInterface().onDeviceNameChanged(&error);
// 	EXPECT_EQ(error, Firebolt::Error::None);
// 	EXPECT_EQ(value, actual_value);
// }


// TEST_F(DeviceTest, TestDevicenetwork)
// {
// 	Firebolt::Error error = Firebolt::Error::None;
// 	auto actual_value = jsonEngine->get_value("Device.network");
// 	actual_value = actual_value.substr(1, actual_value.length() - 2);
// 	auto value = Firebolt::IFireboltAccessor::Instance().DeviceInterface().network(&error);
// 	EXPECT_EQ(error, Firebolt::Error::None);
// 	EXPECT_EQ(value, actual_value);
// }


// TEST_F(DeviceTest, TestDeviceonNameChanged)
// {
// 	Firebolt::Error error = Firebolt::Error::None;
// 	auto actual_value = jsonEngine->get_value("Device.onNameChanged");
// 	actual_value = actual_value.substr(1, actual_value.length() - 2);
// 	auto value = Firebolt::IFireboltAccessor::Instance().DeviceInterface().onNameChanged(&error);
// 	EXPECT_EQ(error, Firebolt::Error::None);
// 	EXPECT_EQ(value, actual_value);
// }


// TEST_F(DeviceTest, TestDeviceonHdcpChanged)
// {
// 	Firebolt::Error error = Firebolt::Error::None;
// 	auto actual_value = jsonEngine->get_value("Device.onHdcpChanged");
// 	actual_value = actual_value.substr(1, actual_value.length() - 2);
// 	auto value = Firebolt::IFireboltAccessor::Instance().DeviceInterface().onHdcpChanged(&error);
// 	EXPECT_EQ(error, Firebolt::Error::None);
// 	EXPECT_EQ(value, actual_value);
// }


// TEST_F(DeviceTest, TestDeviceonHdrChanged)
// {
// 	Firebolt::Error error = Firebolt::Error::None;
// 	auto actual_value = jsonEngine->get_value("Device.onHdrChanged");
// 	actual_value = actual_value.substr(1, actual_value.length() - 2);
// 	auto value = Firebolt::IFireboltAccessor::Instance().DeviceInterface().onHdrChanged(&error);
// 	EXPECT_EQ(error, Firebolt::Error::None);
// 	EXPECT_EQ(value, actual_value);
// }


// TEST_F(DeviceTest, TestDeviceonAudioChanged)
// {
// 	Firebolt::Error error = Firebolt::Error::None;
// 	auto actual_value = jsonEngine->get_value("Device.onAudioChanged");
// 	actual_value = actual_value.substr(1, actual_value.length() - 2);
// 	auto value = Firebolt::IFireboltAccessor::Instance().DeviceInterface().onAudioChanged(&error);
// 	EXPECT_EQ(error, Firebolt::Error::None);
// 	EXPECT_EQ(value, actual_value);
// }


// TEST_F(DeviceTest, TestDeviceonScreenResolutionChanged)
// {
// 	Firebolt::Error error = Firebolt::Error::None;
// 	auto actual_value = jsonEngine->get_value("Device.onScreenResolutionChanged");
// 	actual_value = actual_value.substr(1, actual_value.length() - 2);
// 	auto value = Firebolt::IFireboltAccessor::Instance().DeviceInterface().onScreenResolutionChanged(&error);
// 	EXPECT_EQ(error, Firebolt::Error::None);
// 	EXPECT_EQ(value, actual_value);
// }


// TEST_F(DeviceTest, TestDeviceonVideoResolutionChanged)
// {
// 	Firebolt::Error error = Firebolt::Error::None;
// 	auto actual_value = jsonEngine->get_value("Device.onVideoResolutionChanged");
// 	actual_value = actual_value.substr(1, actual_value.length() - 2);
// 	auto value = Firebolt::IFireboltAccessor::Instance().DeviceInterface().onVideoResolutionChanged(&error);
// 	EXPECT_EQ(error, Firebolt::Error::None);
// 	EXPECT_EQ(value, actual_value);
// }


// TEST_F(DeviceTest, TestDeviceonNetworkChanged)
// {
// 	Firebolt::Error error = Firebolt::Error::None;
// 	auto actual_value = jsonEngine->get_value("Device.onNetworkChanged");
// 	actual_value = actual_value.substr(1, actual_value.length() - 2);
// 	auto value = Firebolt::IFireboltAccessor::Instance().DeviceInterface().onNetworkChanged(&error);
// 	EXPECT_EQ(error, Firebolt::Error::None);
// 	EXPECT_EQ(value, actual_value);
// }
import React, { useEffect, useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { styled } from "styled-components/native";

import { Header, EmptyArea } from "../components/common";
import { TextInputWithTitle } from "../components/text_input";
import { RoundButton, SmallRoundButton } from "../components/buttons";
import { useQuery } from "@tanstack/react-query";
import {
  checkEmailQueryKey,
  checkVerificationCodeQueryKey,
  signUpQueryKey,
  verificationCodeQueryKey,
} from "../constants/apiQueryKeys";
import {
  checkEmail,
  checkVerificationCode,
  getVerificationCode,
  signUp,
} from "../utils/apis";
import { showToast } from "../utils/utils";

type Props = {};

type SignupFieldType =
  | "empty"
  | "name"
  | "birthday"
  | "phoneNumber"
  | "authenticationNumber"
  | "email"
  | "password"
  | "passwordCheck"
  | "address";

/*
  toast, validation, api 연동, 주소찾기, 디테일, 카카오맵 확인, 지라 티켓
*/

const SignupScreen: React.FC<Props> = ({ navigation }) => {
  const [currentFieldType, setCurrentFieldType] =
    useState<SignupFieldType>("empty");
  const [name, setName] = useState("");
  const [isMan, setIsMan] = useState(false);
  const [isFemale, setIsFemale] = useState(false);
  const [birthday, setBirthday] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [authenticationNumber, setAuthenticationNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [address, setAddress] = useState("");
  const [jibunAddress, setJibunAddress] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [isAuthenticationRequested, setIsAuthenticationRequested] =
    useState(false);
  const [isAuthenticationShown, setIsAuthenticationShown] = useState(false);
  const [isCheckAuthenticationRequested, setIsCheckAuthenticationRequested] =
    useState(false);
  const [isAuthenticationCompleted, setIsAuthenticationCompleted] =
    useState(false);
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isEmailRequested, setIsEmailRequested] = useState(false);
  const [isSignUpRequested, setIsSignUpRequested] = useState(false);

  const { data: verificationCodeData, isPending: isVerificationCodePending } =
    useQuery({
      queryKey: [verificationCodeQueryKey, phoneNumber],
      queryFn: () => getVerificationCode(phoneNumber),
      enabled: !!isAuthenticationRequested,
      gcTime: 0,
    });

  const {
    data: checkVerificationCodeData,
    isPending: isCheckVerificationCodePending,
  } = useQuery({
    queryKey: [checkVerificationCodeQueryKey, authenticationNumber],
    queryFn: () =>
      checkVerificationCode({
        phone: phoneNumber,
        code: authenticationNumber,
      }),
    enabled: !!isCheckAuthenticationRequested,
    gcTime: 0,
  });

  const { data: emailData, isPending: isEmailPending } = useQuery({
    queryKey: [checkEmailQueryKey, email],
    queryFn: () => checkEmail(email),
    enabled: !!isEmailRequested,
    gcTime: 0,
  });

  const { data: signUpData, isPending: isSignUpPending } = useQuery({
    queryKey: [signUpQueryKey],
    queryFn: () =>
      signUp({
        memberName: name,
        sex: isMan ? "M" : "F",
        birthday: birthday.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"),
        phone: phoneNumber.substring(1, phoneNumber.length + 1),
        email,
        password,
        address: `${address} ${addressDetail}`,
      }),
    enabled: !!isSignUpRequested,
  });

  useEffect(() => {
    if (
      verificationCodeData?.data?.common?.status &&
      !isVerificationCodePending
    ) {
      if (verificationCodeData.data.common.status === "success") {
        setIsAuthenticationShown(true);
      } else {
        showToast(`${verificationCodeData.data.common.message}`, "errorToast");
      }
      setIsAuthenticationRequested(false);
    }
  }, [verificationCodeData, isVerificationCodePending]);

  useEffect(() => {
    if (
      checkVerificationCodeData?.data?.common?.status &&
      !isCheckVerificationCodePending
    ) {
      if (checkVerificationCodeData.data.common.status === "success") {
        setIsAuthenticationCompleted(true);
        showToast("본인인증이 완료되었습니다", "successToast");
      } else {
        showToast(`인증번호가 틀렸습니다.`, "errorToast");
      }
      setIsCheckAuthenticationRequested(false);
    }
  }, [checkVerificationCodeData, isCheckVerificationCodePending]);

  useEffect(() => {
    if (emailData?.data?.common?.status && !isEmailPending) {
      if (emailData.data.common.status === "success") {
        setIsEmailChecked(true);
      } else {
        showToast(`${emailData.data.common.message}`, "errorToast");
      }
      setIsEmailRequested(false);
    }
  }, [isEmailPending, emailData]);

  useEffect(() => {
    if (signUpData?.data?.common?.status && !isSignUpPending) {
      if (signUpData.data.common.status === "success") {
        console.log("11>>>");
        setIsSignUpRequested(true);
        navigation.replace("SignupComplete");
      } else {
        console.log("22>>>");
      }
    }
  }, [isSignUpPending, signUpData, navigation]);

  useEffect(() => {
    setIsEmailChecked(false);
  }, [email]);

  const isButtonActivated = useMemo(() => {
    if (
      name &&
      birthday &&
      (isMan || isFemale) &&
      phoneNumber &&
      email &&
      password &&
      passwordCheck &&
      isEmailChecked &&
      address
    )
      return true;
    return false;
    // return true;
  }, [
    name,
    birthday,
    isMan,
    isFemale,
    phoneNumber,
    email,
    password,
    passwordCheck,
    isEmailChecked,
    address,
  ]);

  // const showToast = (text: string, type: string) => {
  //   Toast.show({
  //     type,
  //     props: { text },
  //     position: "top",
  //     topOffset: getStatusBarHeight() + 41,
  //   });
  // };

  const navigateToSearchAddressScreen = () => {
    navigation.navigate("SearchAddress", {
      onSendingAddress: ({ jibunAddress, address }) => {
        setAddress(address);
        setJibunAddress(jibunAddress);
      },
    });
  };
  return (
    <Container>
      <HeaderContainer>
        <Header title="회원가입" isLeftButton />
      </HeaderContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <AvoidingView>
          <InnnerContainer>
            <EmptyArea height={40} />
            <InputContainer>
              <TextInputWithTitle
                title="이름"
                textValue={name}
                placeholder="이름이 뭐에요?"
                keyboardType="email-address"
                onChangeText={(text: string) => {
                  setName(text);
                }}
                isActived={currentFieldType === "name"}
                onFocus={() => setCurrentFieldType("name")}
              />
              <EmptyArea width={10} />
              <SmallRoundButton
                onPress={() => {
                  setCurrentFieldType("name");
                  if (!isMan) {
                    setIsMan(true);
                    setIsFemale(false);
                  }
                }}
                buttonText="남"
                isActived={currentFieldType === "name"}
                buttonType={isMan ? "filled" : "default"}
              />
              <EmptyArea width={7} />
              <SmallRoundButton
                onPress={() => {
                  setCurrentFieldType("name");
                  if (!isFemale) {
                    setIsFemale(true);
                    setIsMan(false);
                  }
                }}
                buttonText="여"
                isActived={currentFieldType === "name"}
                buttonType={isFemale ? "filled" : "default"}
              />
            </InputContainer>
            <EmptyArea height={24} />
            <TextInputWithTitle
              title="생년월일"
              textValue={birthday}
              placeholder="ex) 1990.10.19"
              keyboardType="numeric"
              onChangeText={(text: string) => {
                setBirthday(text);
                // console.log("text>>>", text);
                // if (text.length <= 8) {
                //   // 입력된 텍스트에서 숫자만 추출
                //   // console.log("text>>>", text);
                //   // const numbersOnly = text.replace(/\D/g, "");

                //   // console.log("numbersOnly>>>", numbersOnly);
                //   // // 포맷된 문자열 생성 (YYYY.MM.DD 형식)
                //   // let formatted = "";
                //   // if (numbersOnly.length >= 4) {
                //   //   formatted += numbersOnly.substring(0, 4) + ".";
                //   // }
                //   // if (numbersOnly.length >= 6) {
                //   //   formatted += numbersOnly.substring(4, 6) + ".";
                //   // }
                //   // if (numbersOnly.length >= 8) {
                //   //   formatted += numbersOnly.substring(6, 8);
                //   // }

                //   // console.log("formatted>>>", formatted);

                //   setBirthday(text);
                // }
              }}
              isActived={currentFieldType === "birthday"}
              onFocus={() => setCurrentFieldType("birthday")}
              // mask={
              //   [/\d/, /\d/, /\d/, /\d/, ".", /\d/, /\d/, ".", /\d/, /\d/]
              // }
              maxLength={8}
            />
            <EmptyArea height={24} />
            <InputContainer>
              <TextInputWithTitle
                title="전화번호"
                textValue={phoneNumber}
                placeholder="ex) 01037484562"
                keyboardType="numeric"
                onChangeText={(text: string) => {
                  if (text.length <= 11) {
                    setPhoneNumber(text);
                  }
                }}
                isActived={currentFieldType === "phoneNumber"}
                onFocus={() => setCurrentFieldType("phoneNumber")}
                maxLength={11}
              />
              <EmptyArea width={10} />
              <SmallRoundButton
                onPress={() => {
                  if (!isAuthenticationCompleted && phoneNumber.length >= 10) {
                    setIsAuthenticationRequested(true);
                  }
                }}
                buttonText={
                  isAuthenticationCompleted ? "인증완료" : "인증번호받기"
                }
                isActived={
                  (phoneNumber.length >= 10 && !isAuthenticationRequested) ||
                  (isAuthenticationCompleted &&
                    currentFieldType === "phoneNumber")
                }
                buttonType={
                  isAuthenticationRequested
                    ? "complete"
                    : phoneNumber.length >= 10
                    ? "filled"
                    : "default"
                }
              />
            </InputContainer>
            <EmptyArea height={24} />
            {isAuthenticationShown && !isAuthenticationCompleted && (
              <>
                <InputContainer>
                  <TextInputWithTitle
                    title="인증번호"
                    textValue={authenticationNumber}
                    placeholder=""
                    keyboardType="numeric"
                    onChangeText={(text: string) => {
                      setAuthenticationNumber(text);
                    }}
                    isActived={currentFieldType === "authenticationNumber"}
                    onFocus={() => setCurrentFieldType("authenticationNumber")}
                  />
                  <EmptyArea width={10} />
                  <SmallRoundButton
                    onPress={() => {
                      setCurrentFieldType("phoneNumber");
                      setIsCheckAuthenticationRequested(true);
                    }}
                    buttonText="인증완료"
                    isActived={currentFieldType === "authenticationNumber"}
                    buttonType="filled"
                  />
                </InputContainer>
                <EmptyArea height={24} />
              </>
            )}
            <InputContainer>
              <TextInputWithTitle
                title="이메일"
                textValue={email}
                placeholder="이메일주소를 써주세요!"
                keyboardType="email-address"
                onChangeText={(text: string) => {
                  setEmail(text);
                }}
                isActived={currentFieldType === "email"}
                onFocus={() => setCurrentFieldType("email")}
              />
              <EmptyArea width={10} />
              <SmallRoundButton
                onPress={() => {
                  if (!isEmailChecked) setIsEmailRequested(true);
                }}
                buttonText={isEmailChecked ? "사용가능" : "중복확인"}
                isActived={currentFieldType === "email"}
                buttonType={isEmailChecked ? "complete" : "filled"}
              />
            </InputContainer>
            <EmptyArea height={24} />
            <TextInputWithTitle
              title="비밀번호"
              textValue={password}
              placeholder="비밀번호를 정해주세요!"
              keyboardType="email-address"
              secureTextEntry
              onChangeText={(text: string) => {
                setPassword(text);
              }}
              isActived={currentFieldType === "password"}
              onFocus={() => setCurrentFieldType("password")}
            />
            <EmptyArea height={24} />
            <TextInputWithTitle
              title="비밀번호 확인"
              textValue={passwordCheck}
              placeholder="비밀번호가 맞는지 확인해주세요!"
              keyboardType="email-address"
              secureTextEntry
              onChangeText={(text: string) => {
                setPasswordCheck(text);
              }}
              isActived={currentFieldType === "passwordCheck"}
              onFocus={() => setCurrentFieldType("passwordCheck")}
            />
            <EmptyArea height={24} />
            <TextInputWithTitle
              title="주소"
              textValue={address}
              placeholder="우편번호 찾기"
              keyboardType="email-address"
              onChangeText={(text: string) => {
                setAddress(text);
              }}
              isActived={currentFieldType === "address"}
              onFocus={() => {
                setCurrentFieldType("address");
              }}
              onTouchStart={navigateToSearchAddressScreen}
              readOnly
            />
            <EmptyArea height={12} />
            <TextInputWithTitle
              textValue={jibunAddress}
              placeholder="주소를 찾아주세요"
              keyboardType="email-address"
              onChangeText={(text: string) => {
                setJibunAddress(text);
              }}
              isActived={currentFieldType === "jibunAddress"}
              onFocus={() => setCurrentFieldType("jibunAddress")}
              onTouchStart={navigateToSearchAddressScreen}
              readOnly
            />
            <EmptyArea height={12} />
            <TextInputWithTitle
              textValue={addressDetail}
              placeholder="상세주소를 입력해주세요"
              keyboardType="email-address"
              onChangeText={(text: string) => {
                setAddressDetail(text);
              }}
              isActived={currentFieldType === "addressDetail"}
              onFocus={() => setCurrentFieldType("addressDetail")}
            />
            <EmptyArea height={24} />
            <RoundButton
              buttonText="다음"
              isActived={isButtonActivated}
              onPress={() => {
                setIsSignUpRequested(true);
                // navigation.replace("SignupComplete");
                // showToast("토스트1", "successToast");
                // showToast("토스트2", "errorToast")
              }}
            />
          </InnnerContainer>
        </AvoidingView>
      </KeyboardAvoidingView>
    </Container>
  );
};

const Container = styled.SafeAreaView`
  display: flex;
  flex: 1;
  background-color: white;
`;

const AvoidingView = styled.ScrollView`
  display: flex;
  flex: 1;
`;

const HeaderContainer = styled.View`
  position: sticky;
`;

const InnnerContainer = styled.View`
  display: flex;
  margin-horizontal: 24px;
  flex: 1;
`;

const InputContainer = styled.View`
  flex-direction: row;
  align-items: flex-end;
`;

export default SignupScreen;

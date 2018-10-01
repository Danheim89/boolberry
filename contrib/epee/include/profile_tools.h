// Copyright (c) 2006-2013, Andrey N. Sabelnikov, www.sabelnikov.net
// All rights reserved.
// 
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
// * Redistributions of source code must retain the above copyright
// notice, this list of conditions and the following disclaimer.
// * Redistributions in binary form must reproduce the above copyright
// notice, this list of conditions and the following disclaimer in the
// documentation and/or other materials provided with the distribution.
// * Neither the name of the Andrey N. Sabelnikov nor the
// names of its contributors may be used to endorse or promote products
// derived from this software without specific prior written permission.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER  BE LIABLE FOR ANY
// DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
// 


#ifndef _PROFILE_TOOLS_H_
#define _PROFILE_TOOLS_H_

#include <chrono>
#include "print_fixed_dec_point_helper.h"

// 0 - no profiling, 1 - basic, 2 - full, 3 - ultimate
#define PROFILING_LEVEL 1

#if PROFILING_LEVEL >= 1
#  define PROF_L1_START(timer_var) TIME_MEASURE_START(timer_var)
#  define PROF_L1_FINISH(timer_var) TIME_MEASURE_FINISH(timer_var)
#  define PROF_L1_STR_MS(str, timer_var) str << epee::print_mcsec_as_ms(timer_var, 8)
#  define PROF_L1_STR_MS_STR(str, timer_var, text2) str << epee::print_mcsec_as_ms(timer_var, 8) << text2
#  define PROF_L1_STR(str) str
#  define PROF_L1_DO(statement) statement
#  define PROF_L1_LOG_PRINT(str, log_level) LOG_PRINT(str, log_level)
#define ENABLE_PROFILING
#else
#  define PROF_L1_START(timer_var) 
#  define PROF_L1_FINISH(timer_var) 
#  define PROF_L1_STR_MS(str, timer_var) ""
#  define PROF_L1_STR_MS_STR(str, timer_var, text2) ""
#  define PROF_L1_STR(str) ""
#  define PROF_L1_DO(statement)
#  define PROF_L1_LOG_PRINT(str, log_level)
#endif

#if PROFILING_LEVEL >= 2
#  define PROF_L2_START(timer_var) TIME_MEASURE_START(timer_var)
#  define PROF_L2_FINISH(timer_var) TIME_MEASURE_FINISH(timer_var)
#  define PROF_L2_STR_MS(str, timer_var) str << epee::print_mcsec_as_ms(timer_var, 8)
#  define PROF_L2_STR_MS_STR(str, timer_var, text2) str << epee::print_mcsec_as_ms(timer_var, 8) << text2
#  define PROF_L2_STR(str) str
#  define PROF_L2_DO(statement) statement
#  define PROF_L2_LOG_PRINT(str, log_level) LOG_PRINT(str, log_level)
#else
#  define PROF_L2_START(timer_var) 
#  define PROF_L2_FINISH(timer_var) 
#  define PROF_L2_STR_MS(str, timer_var) ""
#  define PROF_L2_STR_MS_STR(str, timer_var, text2) ""
#  define PROF_L2_STR(str) ""
#  define PROF_L2_DO(statement)
#  define PROF_L2_LOG_PRINT(str, log_level)
#endif

#if PROFILING_LEVEL >= 3
#  define PROF_L3_START(timer_var) TIME_MEASURE_START(timer_var)
#  define PROF_L3_FINISH(timer_var) TIME_MEASURE_FINISH(timer_var)
#  define PROF_L3_STR_MS(str, timer_var) str << epee::print_mcsec_as_ms(timer_var, 8)
#  define PROF_L3_STR_MS_STR(str, timer_var, text2) str << epee::print_mcsec_as_ms(timer_var, 8) << text2
#  define PROF_L3_STR(str) str
#  define PROF_L3_DO(statement) statement
#  define PROF_L3_LOG_PRINT(str, log_level) LOG_PRINT(str, log_level)
#else
#  define PROF_L3_START(timer_var) 
#  define PROF_L3_FINISH(timer_var) 
#  define PROF_L3_STR_MS(str, timer_var) ""
#  define PROF_L3_STR_MS_STR(str, timer_var, text2) ""
#  define PROF_L3_STR(str) ""
#  define PROF_L3_DO(statement)
#  define PROF_L3_LOG_PRINT(str, log_level)
#endif

namespace epee
{

#ifdef ENABLE_PROFILING
#define PROFILE_FUNC(immortal_ptr_str) static profile_tools::local_call_account lcl_acc(immortal_ptr_str); \
	profile_tools::call_frame cf(lcl_acc);

#define PROFILE_FUNC_SECOND(immortal_ptr_str) static profile_tools::local_call_account lcl_acc2(immortal_ptr_str); \
	profile_tools::call_frame cf2(lcl_acc2);

#define PROFILE_FUNC_THIRD(immortal_ptr_str) static profile_tools::local_call_account lcl_acc3(immortal_ptr_str); \
	profile_tools::call_frame cf3(lcl_acc3);

#define PROFILE_FUNC_ACC(acc) \
	profile_tools::call_frame cf(acc);


#else
#define PROFILE_FUNC(immortal_ptr_str)
#define PROFILE_FUNC_SECOND(immortal_ptr_str)
#define PROFILE_FUNC_THIRD(immortal_ptr_str)
#endif

#define START_WAY_POINTS() uint64_t _____way_point_time = misc_utils::get_tick_count();
#define WAY_POINT(name) {uint64_t delta = misc_utils::get_tick_count()-_____way_point_time; LOG_PRINT("Way point " << name << ": " << delta, LOG_LEVEL_2);_____way_point_time = misc_utils::get_tick_count();}
#define WAY_POINT2(name, avrg_obj) {uint64_t delta = misc_utils::get_tick_count()-_____way_point_time; avrg_obj.push(delta); LOG_PRINT("Way point " << name << ": " << delta, LOG_LEVEL_2);_____way_point_time = misc_utils::get_tick_count();}

#define TIME_MEASURE_START_MS(var_name)    uint64_t var_name = epee::misc_utils::get_tick_count();
#define TIME_MEASURE_FINISH_MS(var_name)   var_name = epee::misc_utils::get_tick_count() - var_name;



#define TIME_MEASURE_START(var_name)  uint64_t var_name = 0;std::chrono::high_resolution_clock::time_point var_name##_chrono = std::chrono::high_resolution_clock::now();
#define TIME_MEASURE_FINISH(var_name)   var_name = std::chrono::duration_cast<std::chrono::microseconds>(std::chrono::high_resolution_clock::now() - var_name##_chrono).count();


  inline std::string print_mcsec_as_ms(uint64_t microseconds, size_t target_width = 0, char padding_char = ' ')
  {
    const uint64_t MCSEC_TO_MS_POINT = 3;
    std::string s = std::to_string(microseconds);
    if (s.size() < MCSEC_TO_MS_POINT + 1)
    {
      s.insert(0, MCSEC_TO_MS_POINT + 1 - s.size(), '0');
    }
    s.insert(s.size() - MCSEC_TO_MS_POINT, ".");
    if (s.size() < target_width)
      s.insert(0, target_width - s.size(), padding_char);
    return s;
  }

namespace profile_tools
{
  static inline void init_profile_session()
  {
    static std::atomic<bool> is_called(false);
    if (!is_called)
    {
      is_called = true;
      LOG_PRINT2("profile_details.log", "*********************************************************************************************************", LOG_LEVEL_0);
    }
  }

	struct local_call_account
	{
		local_call_account(const char* pstr):m_count_of_call(0), m_summary_time_used(0),m_name(pstr)
		{
      init_profile_session();
    }
		~local_call_account()
		{
      LOG_PRINT2("profile_details.log", "PROFILE " << std::left << std::setw(80) << (m_name + ":")
        << "av_time:" << std::setw(15) << epee::string_tools::print_fixed_dec_point(m_count_of_call ? (m_summary_time_used / m_count_of_call) : 0, 3)
        << "sum_time: " << std::setw(15) << epee::string_tools::print_fixed_dec_point(m_summary_time_used, 3)
        << "call_count: " << std::setw(15) << m_count_of_call, LOG_LEVEL_0);

		}

		size_t m_count_of_call;
		uint64_t m_summary_time_used;
		const std::string m_name;
	};
	
	struct call_frame
	{

		call_frame(local_call_account& cc):m_cc(cc)
		{
			cc.m_count_of_call++;
			m_call_time = boost::posix_time::microsec_clock::local_time();
		}
		
		~call_frame()
		{
      boost::posix_time::ptime now_t(boost::posix_time::microsec_clock::local_time());
      boost::posix_time::time_duration delta_microseconds = now_t - m_call_time;
      uint64_t microsec_used = delta_microseconds.total_microseconds();
      m_cc.m_count_of_call++;
      m_cc.m_summary_time_used += microsec_used;
		}
		
	private:
		local_call_account& m_cc;
		boost::posix_time::ptime m_call_time;
	};
	

}
}


#endif //_PROFILE_TOOLS_H_

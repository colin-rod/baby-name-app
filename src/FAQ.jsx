import React from 'react';
import { theme } from './theme';

export default function FAQ() {
  return (
    <div style={{ backgroundColor: theme.background }} className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className={`text-3xl font-bold mb-8 text-center text-[${theme.primaryDark}]`}>Frequently Asked Questions</h1>

        <div className="mb-6">
          <h2 className={`text-xl font-semibold text-[${theme.text}]`}>How do I create a new name list?</h2>
          <p className="text-gray-700 mt-1">After logging in, go to your dashboard and click “Create New List”. Fill in the title and other details, then save.</p>
        </div>

        <div className="mb-6">
          <h2 className={`text-xl font-semibold text-[${theme.text}]`}>How can I invite someone to collaborate on a list?</h2>
          <p className="text-gray-700 mt-1">While editing a list, click “Manage Access & Roles” and use the invite form to send an invite by email.</p>
        </div>

        <div className="mb-6">
          <h2 className={`text-xl font-semibold text-[${theme.text}]`}>What roles can I assign to users?</h2>
          <p className="text-gray-700 mt-1">Roles include Admin, Owner, Submitter, Voter, and Viewer Plus. Each role has different permissions for editing and managing the list.</p>
        </div>

        <div className="mb-6">
          <h2 className={`text-xl font-semibold text-[${theme.text}]`}>How do I accept an invite?</h2>
          <p className="text-gray-700 mt-1">When invited, you'll receive an email with a link. After signing up or logging in, you’ll be able to accept the invite and access the list.</p>
        </div>

        <div className="mb-6">
          <h2 className={`text-xl font-semibold text-[${theme.text}]`}>Can I remove someone from a list?</h2>
          <p className="text-gray-700 mt-1">Yes, if you have Admin or Owner permissions, you can remove users from the list in the Manage Access section.</p>
        </div>

        <div className="mb-6">
          <h2 className={`text-xl font-semibold text-[${theme.text}]`}>What is Elo Rating and why is it used?</h2>
          <p className="text-gray-700 mt-1">
            Elo rating is a system originally used to rank chess players, but it's useful in any setting that involves
            comparing options in pairs. In EloBabyHub, we use Elo to rank baby names based on your preferences. When you
            choose one name over another, the system updates each name’s score. Over time, this helps surface the most
            preferred names according to your consistent choices, even when the total number of comparisons is small.
          </p>
        </div>
      </div>
    </div>
  );
}
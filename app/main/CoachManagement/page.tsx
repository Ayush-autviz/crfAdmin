
"use client"
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Edit, Plus, Search, Trash, UserPlus } from 'lucide-react';
import { toast } from 'sonner';


// Types
interface Coach {
  id: string;
  name: string;
  email: string;
  bio: string;
  expertise: string;
  specializations: string[];
  availabilitySlots: AvailabilitySlot[];
  image: string;
  bookingsCount: number;
}

interface AvailabilitySlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

// Mock data
const dummyCoaches: Coach[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    bio: 'Experienced trader with over 10 years in the financial markets',
    expertise: 'Advanced',
    specializations: ['Swing Trading', 'Risk Management'],
    availabilitySlots: [
      { id: '1-1', day: 'Monday', startTime: '09:00', endTime: '10:00', isBooked: false },
      { id: '1-2', day: 'Monday', startTime: '11:00', endTime: '12:00', isBooked: true },
      { id: '1-3', day: 'Wednesday', startTime: '14:00', endTime: '15:00', isBooked: false },
    ],
    image: '/placeholder.svg?height=80&width=80',
    bookingsCount: 12,
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    bio: 'Options trading specialist with focus on risk-defined strategies',
    expertise: 'Intermediate',
    specializations: ['Options Trading', 'Day Trading'],
    availabilitySlots: [
      { id: '2-1', day: 'Tuesday', startTime: '10:00', endTime: '11:00', isBooked: false },
      { id: '2-2', day: 'Thursday', startTime: '15:00', endTime: '16:00', isBooked: true },
    ],
    image: '/placeholder.svg?height=80&width=80',
    bookingsCount: 8,
  },
];

// Available specializations
const availableSpecializations = [
  'Swing Trading',
  'Day Trading',
  'Risk Management',
  'Options Trading',
  'Technical Analysis',
  'Fundamental Analysis',
  'Portfolio Management',
];

// Days of the week
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Time slots for selection
const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

export default function CoachManagement() {
  const [coaches, setCoaches] = useState<Coach[]>(dummyCoaches);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSlotsDialogOpen, setIsSlotsDialogOpen] = useState(false);
  const [isViewBookingsDialogOpen, setIsViewBookingsDialogOpen] = useState(false);
  const [currentCoach, setCurrentCoach] = useState<Coach | null>(null);
  const [coachName, setCoachName] = useState('');
  const [coachEmail, setCoachEmail] = useState('');
  const [coachBio, setCoachBio] = useState('');
  const [coachExpertise, setCoachExpertise] = useState('');
  const [coachSpecializations, setCoachSpecializations] = useState<string[]>([]);
  const [newSlotDay, setNewSlotDay] = useState('');
  const [newSlotStart, setNewSlotStart] = useState('');
  const [newSlotEnd, setNewSlotEnd] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Filtered coaches based on search
  const filteredCoaches = coaches.filter(
    (coach) =>
      coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coach.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coach.specializations.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const resetForm = () => {
    setCoachName('');
    setCoachEmail('');
    setCoachBio('');
    setCoachExpertise('');
    setCoachSpecializations([]);
    setNewSlotDay('');
    setNewSlotStart('');
    setNewSlotEnd('');
    setCurrentCoach(null);
  };

  const handleCreateCoach = () => {
    if (!coachName || !coachEmail || !coachExpertise) {
      toast.error('Missing Information', {
        description: 'Please fill in all required fields.',
      });
      return;
    }

    setIsProcessing(true);

    // Simulate API call
    setTimeout(() => {
      const newCoach: Coach = {
        id: `${coaches.length + 1}`,
        name: coachName,
        email: coachEmail,
        bio: coachBio,
        expertise: coachExpertise,
        specializations: coachSpecializations,
        availabilitySlots: [],
        image: '/placeholder.svg?height=80&width=80',
        bookingsCount: 0,
      };

      setCoaches([...coaches, newCoach]);
      setIsCreateDialogOpen(false);
      resetForm();
      setIsProcessing(false);

      toast.success('Coach Created', {
        description: 'The new coach has been added successfully.',
      });
    }, 1000);
  };

  const handleEditCoach = () => {
    if (!currentCoach || !coachName || !coachEmail || !coachExpertise) {
      toast.error('Missing Information', {
        description: 'Please fill in all required fields.',
      });
      return;
    }

    setIsProcessing(true);

    // Simulate API call
    setTimeout(() => {
      const updatedCoaches = coaches.map((coach) => {
        if (coach.id === currentCoach.id) {
          return {
            ...coach,
            name: coachName,
            email: coachEmail,
            bio: coachBio,
            expertise: coachExpertise,
            specializations: coachSpecializations,
          };
        }
        return coach;
      });

      setCoaches(updatedCoaches);
      setIsEditDialogOpen(false);
      resetForm();
      setIsProcessing(false);

      toast.success('Coach Updated', {
        description: 'The coach information has been updated.',
      });
    }, 1000);
  };

  const handleDeleteCoach = (id: string) => {
    setCoaches(coaches.filter((coach) => coach.id !== id));
    toast.success('Coach Deleted', {
      description: 'The coach has been removed.',
    });
  };

  const handleAddSlot = () => {
    if (!currentCoach || !newSlotDay || !newSlotStart || !newSlotEnd) {
      toast.error('Missing Information', {
        description: 'Please fill in all availability slot fields.',
      });
      return;
    }

    // Validate time slot
    if (newSlotStart >= newSlotEnd) {
      toast.error('Invalid Time Slot', {
        description: 'End time must be after start time.',
      });
      return;
    }

    setIsProcessing(true);

    // Simulate API call
    setTimeout(() => {
      const newSlot: AvailabilitySlot = {
        id: `${currentCoach.id}-${Date.now()}`,
        day: newSlotDay,
        startTime: newSlotStart,
        endTime: newSlotEnd,
        isBooked: false,
      };

      const updatedCoaches = coaches.map((coach) => {
        if (coach.id === currentCoach.id) {
          return {
            ...coach,
            availabilitySlots: [...coach.availabilitySlots, newSlot],
          };
        }
        return coach;
      });

      setCoaches(updatedCoaches);
      setCurrentCoach({
        ...currentCoach,
        availabilitySlots: [...currentCoach.availabilitySlots, newSlot],
      });
      setNewSlotDay('');
      setNewSlotStart('');
      setNewSlotEnd('');
      setIsProcessing(false);

      toast.success('Slot Added', {
        description: "The availability slot has been added to the coach's schedule.",
      });
    }, 500);
  };

  const handleRemoveSlot = (slotId: string) => {
    if (!currentCoach) return;

    const updatedCoaches = coaches.map((coach) => {
      if (coach.id === currentCoach.id) {
        return {
          ...coach,
          availabilitySlots: coach.availabilitySlots.filter((slot) => slot.id !== slotId),
        };
      }
      return coach;
    });

    setCoaches(updatedCoaches);
    setCurrentCoach({
      ...currentCoach,
      availabilitySlots: currentCoach.availabilitySlots.filter((slot) => slot.id !== slotId),
    });

    toast.success('Slot Removed', {
      description: "The availability slot has been removed from the coach's schedule.",
    });
  };

  const openEditDialog = (coach: Coach) => {
    setCurrentCoach(coach);
    setCoachName(coach.name);
    setCoachEmail(coach.email);
    setCoachBio(coach.bio);
    setCoachExpertise(coach.expertise);
    setCoachSpecializations(coach.specializations);
    setIsEditDialogOpen(true);
  };

  const openSlotsDialog = (coach: Coach) => {
    setCurrentCoach(coach);
    setIsSlotsDialogOpen(true);
  };

  const openViewBookingsDialog = (coach: Coach) => {
    setCurrentCoach(coach);
    setIsViewBookingsDialogOpen(true);
  };

  const toggleSpecialization = (specialization: string) => {
    if (coachSpecializations.includes(specialization)) {
      setCoachSpecializations(coachSpecializations.filter((s) => s !== specialization));
    } else {
      setCoachSpecializations([...coachSpecializations, specialization]);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl text-white font-bold mb-2">Coach Management</h1>
          <p className="text-sm text-[#A4A4A4]">Create and manage your coaching staff</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#F6BE00] text-black hover:bg-[#F6BE00]">
              <UserPlus className="mr-2 h-4 w-4" /> Add Coach
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1A1F2C] text-white border-[#323D50] max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Coach</DialogTitle>
              <DialogDescription className="text-[#A4A4A4]">
                Add a new coach to your coaching staff.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Coach Name*</Label>
                  <Input
                    id="name"
                    value={coachName}
                    onChange={(e) => setCoachName(e.target.value)}
                    placeholder="Enter coach name"
                    className="bg-[#334155] border-0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email*</Label>
                  <Input
                    id="email"
                    type="email"
                    value={coachEmail}
                    onChange={(e) => setCoachEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="bg-[#334155] border-0"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bio">Biography</Label>
                <Textarea
                  id="bio"
                  value={coachBio}
                  onChange={(e) => setCoachBio(e.target.value)}
                  placeholder="Enter coach bio"
                  className="bg-[#334155] border-0 min-h-[100px]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expertise">Expertise Level*</Label>
                <Select value={coachExpertise} onValueChange={setCoachExpertise}>
                  <SelectTrigger className="bg-[#334155] border-0">
                    <SelectValue placeholder="Select expertise level" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#334155] border-0">
                    <SelectItem className='text-white' value="Beginner">Beginner</SelectItem>
                    <SelectItem className='text-white' value="Intermediate">Intermediate</SelectItem>
                    <SelectItem className='text-white' value="Advanced">Advanced</SelectItem>
                    <SelectItem className='text-white' value="Expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Specializations</Label>
                <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto bg-[#334155] border-0 rounded-md p-3">
                  {availableSpecializations.map((spec) => (
                    <div key={spec} className="flex items-center space-x-2">
                      <Checkbox
                        id={`spec-${spec}`}
                        checked={coachSpecializations.includes(spec)}
                        onCheckedChange={() => toggleSpecialization(spec)}
                      />
                      <label
                        htmlFor={`spec-${spec}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {spec}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button className='text-black' variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-[#F6BE00] text-black hover:bg-[#F6BE00]"
                onClick={handleCreateCoach}
                disabled={isProcessing}
              >
                {isProcessing ? 'Creating...' : 'Create Coach'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-[#162033] shadow-lg">
          <CardHeader className="mb-0">
            <CardTitle className="text-2xl text-white font-bold">
              Total Coaches
            </CardTitle>
          </CardHeader>
          <CardContent className='mt-0'>
            <div className="text-2xl text-[#F6BE00] font-bold">{coaches.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#162033] shadow-lg">
          <CardHeader className="mb-0">
            <CardTitle className="text-2xl text-white font-bold">
              Total Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-[#F6BE00] font-bold">
              {coaches.reduce((total, coach) => total + coach.bookingsCount, 0)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#162033] shadow-lg">
          <CardHeader className="">
            <CardTitle className="text-2xl text-white font-bold">
              Available Slots
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-[#F6BE00] font-bold">
              {coaches.reduce(
                (total, coach) =>
                  total + coach.availabilitySlots.filter((slot) => !slot.isBooked).length,
                0
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#162033] shadow-lg mb-6">
        <CardContent className="">
          {/* <div className="relative mb-6 w-full md:w-[60%] bg-[#263345] rounded-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coaches by name, email, or specialization..."
              className="pl-10 bg-transparent border-none rounded-full text-white h-12"
            />
          </div> */}

          <Table>
            <TableHeader>
              <TableRow className="hover:bg-[#334155]">
                <TableHead className="text-white">Coach</TableHead>
                <TableHead className="text-white">Email</TableHead>
                <TableHead className="text-white">Specializations</TableHead>
                <TableHead className="text-white">Level</TableHead>
                <TableHead className="text-white">Available Slots</TableHead>
                <TableHead className="text-white">Bookings</TableHead>
                <TableHead className="text-right text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCoaches.map((coach) => (
                <TableRow key={coach.id} className="hover:bg-[#334155]">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <img
                        src={coach.image}
                        alt={coach.name}
                        className="h-10 w-10 rounded-full"
                      />
                      <span className="font-medium text-white">{coach.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className='text-white'>{coach.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {coach.specializations.slice(0, 2).map((spec) => (
                        <Badge key={spec} className="bg-[#334155] text-white">
                          {spec}
                        </Badge>
                      ))}
                      {coach.specializations.length > 2 && (
                        <Badge className="bg-[#334155] text-white">
                          +{coach.specializations.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className='text-white'>{coach.expertise}</TableCell>
                  <TableCell className='text-white'>
                    {coach.availabilitySlots.filter((slot) => !slot.isBooked).length}
                  </TableCell>
                  <TableCell className='text-white'>{coach.bookingsCount}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      className='text-[#FFC107]'
                      size="sm"
                      onClick={() => openSlotsDialog(coach)}
                    >
                      Slots
                    </Button>
                    <Button
                      className='text-[#FFC107]'
                      variant="ghost"
                      size="sm"
                      onClick={() => openViewBookingsDialog(coach)}
                    >
                      Bookings
                    </Button>
                    <Button
                      className='text-[#FFC107]'
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(coach)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      className='text-[#FFC107]'
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCoach(coach.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCoaches.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-[#A4A4A4]">
                    No coaches found matching your search criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Coach Dialog */}
      {currentCoach && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-[#1A1F2C] text-white border-[#323D50] max-w-2xl">
            <DialogHeader>
              <DialogTitle className='text-xl text-white font-bold '>Edit Coach</DialogTitle>
              <DialogDescription className="text-[#A4A4A4] text-sm">
                Update coach information.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Coach Name*</Label>
                  <Input
                    id="edit-name"
                    value={coachName}
                    onChange={(e) => setCoachName(e.target.value)}
                    className="bg-[#334155] border-0 mt-2"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-email">Email*</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={coachEmail}
                    onChange={(e) => setCoachEmail(e.target.value)}
                    className="bg-[#334155] border-0 mt-2"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-bio">Biography</Label>
                <Textarea
                  id="edit-bio"
                  value={coachBio}
                  onChange={(e) => setCoachBio(e.target.value)}
                  className="bg-[#334155] border-0 min-h-[100px] mt-2"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-expertise">Expertise Level*</Label>
                <Select  value={coachExpertise} onValueChange={setCoachExpertise}>
                  <SelectTrigger className="bg-[#334155] border-0 text-white mt-2">
                    <SelectValue className='text-white' placeholder="Select expertise level" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#334155] border-0 text-white">
                    <SelectItem className='text-white' value="Beginner">Beginner</SelectItem>
                    <SelectItem className='text-white' value="Intermediate">Intermediate</SelectItem>
                    <SelectItem className='text-white' value="Advanced">Advanced</SelectItem>
                    <SelectItem className='text-white' value="Expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Specializations</Label>
                <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto bg-[#334155] border-0 rounded-md p-3">
                  {availableSpecializations.map((spec) => (
                    <div key={spec} className="flex items-center space-x-2">
                      <Checkbox
                        id={`spec-edit-${spec}`}
                        checked={coachSpecializations.includes(spec)}
                        onCheckedChange={() => toggleSpecialization(spec)}
                      />
                      <label
                        htmlFor={`spec-edit-${spec}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {spec}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button className='text-black' variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-[#F6BE00] text-black hover:bg-[#F6BE00]"
                onClick={handleEditCoach}
                disabled={isProcessing}
              >
                {isProcessing ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Availability Slots Dialog */}
      {currentCoach && (
        <Dialog open={isSlotsDialogOpen} onOpenChange={setIsSlotsDialogOpen}>
          <DialogContent className="bg-[#1A1F2C] text-white border-[#323D50] max-w-2xl">
            <DialogHeader>
              <DialogTitle className='text-xl text-white font-bold'>Manage Availability Slots</DialogTitle>
              <DialogDescription className="text-[#A4A4A4] text-sm">
                Set available time slots for {currentCoach.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Add new slot */}
              <div className="bg-[#263345] p-4 rounded-md">
                <h4 className="text-sm text-white font-semibold mb-3">Add New Availability Slot</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="day">Day</Label>
                    <Select value={newSlotDay} onValueChange={setNewSlotDay}>
                      <SelectTrigger className="bg-[#162033] border-0 placeholder:text-white text-white mt-2">
                        <SelectValue className='text-white placeholder:text-white' placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#162033] border-[#323D50]">
                        {daysOfWeek.map((day) => (
                          <SelectItem className='text-white' key={day} value={day}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="start-time">Start Time</Label>
                    <Select value={newSlotStart} onValueChange={setNewSlotStart}>
                      <SelectTrigger className="bg-[#162033] border-0 mt-2">
                        <SelectValue placeholder="Start" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#162033] border-0 max-h-[200px]">
                        {timeSlots.map((time) => (
                          <SelectItem className='text-white' key={`start-${time}`} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="end-time">End Time</Label>
                    <Select value={newSlotEnd} onValueChange={setNewSlotEnd}>
                      <SelectTrigger className="bg-[#162033] border-0 mt-2">
                        <SelectValue placeholder="End" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#162033] border-0 max-h-[200px]">
                        {timeSlots.map((time) => (
                          <SelectItem className='text-white' key={`end-${time}`} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-3">
                  <Button
                    className="bg-[#F6BE00] text-black hover:bg-[#F6BE00] w-full"
                    onClick={handleAddSlot}
                    disabled={isProcessing}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Slot
                  </Button>
                </div>
              </div>

              {/* Existing slots */}
              <div className="max-h-[300px] overflow-y-auto bg-[#162033]  border-0 rounded-md">
                <h4 className="text-sm font-semibold p-3 border-b border-[#323D50]">
                  Current Availability Slots
                </h4>
                {currentCoach.availabilitySlots.length > 0 ? (
                  <div className="divide-y divide-[#323D50]">
                    {currentCoach.availabilitySlots.map((slot) => (
                      <div key={slot.id} className="flex items-center justify-between p-3">
                        <div>
                          <span className="font-medium">{slot.day}</span>
                          <span className="text-[#A4A4A4] ml-1">
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {slot.isBooked ? (
                            <Badge className="bg-[#EA5A0C] text-white">Booked</Badge>
                          ) : (
                            <Badge className="bg-[#10B981] text-white">Available</Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={slot.isBooked}
                            onClick={() => handleRemoveSlot(slot.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-center text-[#A4A4A4]">
                    No availability slots defined yet.
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button className='text-black' variant="outline" onClick={() => setIsSlotsDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* View Bookings Dialog */}
      {currentCoach && (
        <Dialog open={isViewBookingsDialogOpen} onOpenChange={setIsViewBookingsDialogOpen}>
          <DialogContent className="bg-[#1A1F2C] text-white border-[#323D50] max-w-2xl">
            <DialogHeader>
              <DialogTitle className='text-2xl text-white font-bold'>Booking History</DialogTitle>
              <DialogDescription className="text-[#A4A4A4] text-sm">
                View all bookings for {currentCoach.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {currentCoach.bookingsCount > 0 ? (
                [...Array(Math.min(currentCoach.bookingsCount, 5))].map((_, index) => (
                  <Card key={index} className="bg-[#263345] border-[#323D50]">
                    <CardContent className="">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-white mb-1">User{index + 1}@example.com</h4>
                          <p className="text-sm text-[#A4A4A4] mb-2">
                            {daysOfWeek[index % 7]}, {index + 9}:00 - {index + 10}:00
                          </p>
                          <Badge className={index % 2 === 0 ? "bg-[#10B981] text-white" : "bg-[#F59E0B] text-white"}>
                            {index % 2 === 0 ? "Completed" : "Upcoming"}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-white ">Booked on</p>
                          <p className="text-sm text-[#A4A4A4]">April {10 + index}, 2025</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-[#A4A4A4]">
                  No bookings found for this coach.
                </div>
              )}
            </div>
            <DialogFooter>
              <Button className='text-black' variant="outline" onClick={() => setIsViewBookingsDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
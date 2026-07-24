"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function MachineForm() {
    return (
        <Card className="mx-auto max-w-4xl">
            <CardHeader>
                <CardTitle>Register Machine</CardTitle>
                <CardDescription>
                    Add a new machine to the system.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Machine Name
                            </label>

                            <Input
                                placeholder="Enter machine name"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Manufacturer
                            </label>

                            <Input
                                placeholder="Enter manufacturer"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Category
                        </label>

                        <Input placeholder="Category" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Description
                        </label>

                        <Textarea
                            rows={5}
                            placeholder="Enter description"
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                        >
                            Cancel
                        </Button>

                        <Button type="submit">
                            Save Machine
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}